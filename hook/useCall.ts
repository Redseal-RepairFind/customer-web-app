// app/hooks/useCallEngine.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  IRemoteAudioTrack,
  NetworkQuality,
} from "agora-rtc-sdk-ng";
import { useSocket } from "@/contexts/socket-contexts";
import { CallState } from "@/components/dashboard/inbox/call-portal";
import { callApi } from "@/lib/api/actions/dashboard-actions/inbox-calls/calls";
import { MakeCallType } from "@/utils/types";

/* =================================================================================
 * Types
 * ================================================================================= */

type Phase = CallState | "idle";
type Role = "caller" | "callee";

type OutgoingSession = {
  appId: string;
  callId: string;
  channel: string;
  token: string;
  uid: number;
  name?: string;
  image?: string;
};

type JoinParams = {
  appId: string;
  channel: string;
  token: string;
  uid: number;
};

type EndReason = "ended" | "missed" | "declined";

/* =================================================================================
 * Small utils
 * ================================================================================= */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function waitFor<T>(
  getter: () => T | null | undefined,
  timeoutMs = 5000,
  intervalMs = 50
): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = getter();
    if (v != null) return v as T;
    await sleep(intervalMs);
  }
  return getter() ?? null;
}

function normalizeEndReason(input: unknown): EndReason {
  if (input === "ended" || input === "missed" || input === "declined") {
    return input;
  }
  return "ended";
}

/* =================================================================================
 * Helpers (iPad/Safari)
 * ================================================================================= */

async function unlockAudioOnce(): Promise<void> {
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext =
      (window as any).__globalAudioCtx ||
      new Ctx({ latencyHint: "interactive" });
    (window as any).__globalAudioCtx = ctx;
    if (ctx.state === "suspended") {
      await ctx.resume();
      console.log("[CALL] AudioContext resumed");
    }
  } catch (e) {
    console.warn("[CALL] unlockAudioOnce failed:", e);
  }
}

async function requestMicPermission(): Promise<boolean> {
  try {
    const tmp = await AgoraRTC.createMicrophoneAudioTrack();
    tmp.stop();
    tmp.close();
    console.log("[CALL] Mic permission granted");
    return true;
  } catch (e) {
    console.error("[CALL] Mic permission denied:", e);
    return false;
  }
}

async function getPreferredMicId(): Promise<string | undefined> {
  try {
    const list = await AgoraRTC.getMicrophones();
    if (!list.length) return undefined;
    const builtIn =
      list.find((d) => /macbook|built[- ]?in/i.test(d.label)) ?? list[0];
    return builtIn.deviceId || undefined;
  } catch {
    return undefined;
  }
}

/* =================================================================================
 * Hook
 * ================================================================================= */

export function useCallEngine(appId: string) {
  const { socket } = useSocket();

  // Agora refs
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<ILocalAudioTrack | null>(null);
  const remoteAudioRef = useRef<Map<any, IRemoteAudioTrack>>(new Map());
  const remotePeersRef = useRef<Set<string>>(new Set());
  const uidKey = (u: IAgoraRTCRemoteUser | { uid: any }) => String(u.uid);

  // remote joined flag (set ONLY when remote actually publishes/plays)
  const [joined, setJoined] = useState(false);

  // one-off guards
  const wiredRef = useRef(false);
  const joinedRef = useRef(false);
  const endingRef = useRef(false); // idempotent end()

  // timers
  const lowBitrateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // phase/state
  const [phase, setPhase] = useState<Phase>("idle");
  const [role, setRole] = useState<Role | null>(null);

  const [callId, setCallId] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);

  const [remoteName, setRemoteName] = useState<string>("Unknown");
  const [remoteImage, setRemoteImage] = useState<string | undefined>();
  const [muted, setMuted] = useState(false);

  // diagnostics
  const [localLevel, setLocalLevel] = useState<number>(0);
  const [uplinkQuality, setUplinkQuality] = useState<NetworkQuality | 0>(0);
  const [downlinkQuality, setDownlinkQuality] = useState<NetworkQuality | 0>(0);

  // param refs for race-free joins
  const joinParamsRef = useRef<JoinParams | null>(null);
  const volEnabledRef = useRef(false); // guard enableAudioVolumeIndicator

  const setJoinParams = (p: {
    channel: string;
    token: string;
    uid: number;
  }) => {
    if (!appId) return;
    joinParamsRef.current = { appId, ...p };
  };
  const clearJoinParams = () => {
    joinParamsRef.current = null;
  };

  /* -----------------------------------------------------------------------------
   * Init Agora client once + events
   * --------------------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;
    console.log("[CALL] Agora client created");

    if (!wiredRef.current) {
      wiredRef.current = true;

      client.on("connection-state-change", (cur, prev, reason) => {
        console.log("[CALL] connection-state-change:", { prev, cur, reason });
        if (
          (cur === "CONNECTING" || cur === "RECONNECTING") &&
          phase !== "connecting"
        ) {
          setPhase("connecting");
        }
        if (
          cur === "CONNECTED" &&
          (phase === "connecting" ||
            phase === "reconnecting" ||
            phase === "outgoing")
        ) {
          setPhase("active");
        }
        if (cur === "DISCONNECTED" && phase !== "idle" && phase !== "ended") {
          setPhase("reconnecting");
        }
      });

      client.on("exception", (e) => {
        console.warn("[CALL] Agora exception:", e);
        if (e?.code === 2003) {
          if (lowBitrateTimerRef.current) {
            clearTimeout(lowBitrateTimerRef.current);
          }
          lowBitrateTimerRef.current = setTimeout(async () => {
            try {
              const mic = micRef.current;
              if (!mic) return;
              await mic.setEnabled(true);
              setTimeout(async () => {
                if (localLevel <= 1) {
                  console.warn("[CALL] Low bitrate persists — recreating mic");
                  await recreateAndPublishMic("speech_standard");
                }
              }, 1500);
            } catch (err) {
              console.warn("[CALL] Low bitrate soft-recovery error:", err);
            }
          }, 3000);
        }
      });

      const removeRemoteEl = (uidNum: number) => {
        const el = document.querySelector<HTMLAudioElement>(
          `audio[data-agora-remote="${uidNum}"]`
        );
        if (el?.parentNode) el.parentNode.removeChild(el);
      };

      client.on(
        "user-published",
        async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
          console.log("[CALL] user-published:", user.uid, mediaType);
          if (mediaType !== "audio") return;
          try {
            await client.subscribe(user, "audio");
            const track = user.audioTrack;
            if (track) {
              const el = document.createElement("audio");
              el.autoplay = true;
              el.setAttribute("playsinline", "");
              el.setAttribute("webkit-playsinline", "");
              el.setAttribute("data-agora-remote", String(user.uid));
              el.style.position = "fixed";
              el.style.left = "-9999px";
              document.body.appendChild(el);
              track.setVolume(100);
              track.play();
              remoteAudioRef.current.set(uidKey, track);

              // ✅ remote actually joined (we're hearing them)
              setJoined(true);

              console.log("[CALL] remote audio playing:", user.uid);
            }
          } catch (err) {
            console.error("[CALL] subscribe error:", err);
          }
        }
      );

      client.on(
        "user-unpublished",
        (user: IAgoraRTCRemoteUser, mt: "audio" | "video") => {
          console.log("[CALL] user-unpublished:", user.uid, mt);
          const track = remoteAudioRef.current.get(user.uid as number);
          try {
            track?.stop();
          } catch {}
          remoteAudioRef.current.delete(user.uid as number);
          removeRemoteEl(user.uid as number);

          // If nobody is remote now, reset joined
          if (remoteAudioRef.current.size === 0) setJoined(false);
        }
      );

      client.on("user-left", (user: IAgoraRTCRemoteUser) => {
        console.log("[CALL] user-left:", user.uid);
        const track = remoteAudioRef.current.get(user.uid as number);
        try {
          track?.stop();
        } catch {}
        remoteAudioRef.current.delete(user.uid as number);
        removeRemoteEl(user.uid as number);

        if (remoteAudioRef.current.size === 0) setJoined(false);
      });

      client.on("token-privilege-will-expire", () =>
        console.warn("[CALL] token will expire soon")
      );
      client.on("token-privilege-did-expire", () =>
        console.error("[CALL] token expired")
      );
    }

    return () => {
      lowBitrateTimerRef.current && clearTimeout(lowBitrateTimerRef.current);
      client.removeAllListeners();
      clientRef.current = null;
      console.log("[CALL] Agora client disposed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    const onUserJoined = (user: IAgoraRTCRemoteUser) => {
      const key = uidKey(user);
      remotePeersRef.current.add(key);
      setJoined(true); // ✅ mark presence immediately on join
      console.log(
        "[CALL] user-joined:",
        user.uid,
        "peers:",
        remotePeersRef.current.size
      );
    };

    const onUserLeft = (user: IAgoraRTCRemoteUser) => {
      const key = uidKey(user);
      remotePeersRef.current.delete(key);
      // stop/cleanup any leftover track handle
      const t = remoteAudioRef.current.get(key);
      try {
        t?.stop();
      } catch {}
      remoteAudioRef.current.delete(key);

      // update joined based on presence set
      setJoined(remotePeersRef.current.size > 0);
      console.log(
        "[CALL] user-left:",
        user.uid,
        "peers:",
        remotePeersRef.current.size
      );
    };

    client.on("user-joined", onUserJoined);
    client.on("user-left", onUserLeft);
    return () => {
      client.off("user-joined", onUserJoined);
      client.off("user-left", onUserLeft);
    };
  }, []);

  /* -----------------------------------------------------------------------------
   * Diagnostics wiring (volume indicator + network quality)
   * --------------------------------------------------------------------------- */
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    if (!volEnabledRef.current) {
      client.enableAudioVolumeIndicator();
      volEnabledRef.current = true;
    }

    const onVol = (vols: Array<{ uid: number; level: number }>) => {
      const me = vols.find((v) => v.uid === uid || v.uid === 0);
      if (me) setLocalLevel(me.level);
    };
    const onNet = (stats: {
      uplinkNetworkQuality: NetworkQuality;
      downlinkNetworkQuality: NetworkQuality;
    }) => {
      setUplinkQuality(stats.uplinkNetworkQuality);
      setDownlinkQuality(stats.downlinkNetworkQuality);
    };

    client.on("volume-indicator", onVol);
    client.on("network-quality", onNet);
    return () => {
      client.off("volume-indicator", onVol);
      client.off("network-quality", onNet);
    };
  }, [uid]);

  /* -----------------------------------------------------------------------------
   * Cleanup
   * --------------------------------------------------------------------------- */
  const cleanup = useCallback(async () => {
    const client = clientRef.current;
    try {
      if (micRef.current && client) {
        try {
          await client.unpublish([micRef.current]);
        } catch {}
      }
      if (micRef.current) {
        micRef.current.stop();
        micRef.current.close();
        micRef.current = null;
      }

      remoteAudioRef.current.forEach((t, uidNum) => {
        try {
          t.stop();
        } catch {}
        const el = document.querySelector<HTMLAudioElement>(
          `audio[data-agora-remote="${uidNum}"]`
        );
        if (el?.parentNode) el.parentNode.removeChild(el);
      });
      remoteAudioRef.current.clear();

      setJoined(false);

      await client?.leave();
      console.log("[CALL] left channel & cleaned up");
    } catch (err) {
      console.warn("[CALL] cleanup error:", err);
    } finally {
      joinedRef.current = false;
      clearJoinParams();
    }
  }, []);

  /* -----------------------------------------------------------------------------
   * End (idempotent, source-aware, event-safe)
   * --------------------------------------------------------------------------- */
  const end = useCallback(
    async (
      reasonOrEvt: unknown = "ended",
      source: "local" | "remote" = "local"
    ) => {
      if (endingRef.current) {
        console.log("[CALL] end() ignored: already ending");
        return;
      }
      endingRef.current = true;

      const reason: EndReason = normalizeEndReason(reasonOrEvt);

      try {
        await cleanup();

        // Only notify server if *we* initiated the end. Server echoes CALL_ENDED.
        if (source === "local" && callId) {
          try {
            await callApi.endCall({ event: reason, id: callId });
          } catch (error: any) {
            console.error("[CALL] endCall API error:", error);
          }
        }
      } finally {
        setPhase("ended");
        setTimeout(() => {
          setPhase("idle");
          setRole(null);
          setCallId(null);
          setChannel(null);
          setToken(null);
          setUid(null);
          setRemoteName("Unknown");
          setRemoteImage(undefined);
          setMuted(false);
          setLocalLevel(0);
          setUplinkQuality(0);
          setDownlinkQuality(0);
          setJoined(false);
          endingRef.current = false;
        }, 400);
      }
    },
    [cleanup, callId]
  );

  /* -----------------------------------------------------------------------------
   * Socket: NEW_INCOMING_CALL + CALL_ENDED
   * --------------------------------------------------------------------------- */
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (obj: any) => {
      const p = obj?.payload?.data ?? obj?.payload ?? obj;
      const typ = obj?.type ?? obj?.payload?.type ?? p?.event;
      if (typ !== "NEW_INCOMING_CALL") return;

      const incoming = {
        callId: p?.callId,
        channel: p?.channel,
        token: p?.token,
        uid: Number(p?.uid),
        name: p?.name,
        image: p?.image,
      };

      if (
        !incoming.callId ||
        !incoming.channel ||
        !incoming.token ||
        !incoming.uid
      ) {
        console.warn("[CALL] incoming missing data:", incoming);
        return;
      }

      setRole("callee");
      setCallId(incoming.callId);
      setChannel(incoming.channel);
      setToken(incoming.token);
      setUid(incoming.uid);
      setRemoteName(incoming.name || "Unknown");
      setRemoteImage(incoming.image);
      setJoinParams({
        channel: incoming.channel,
        token: incoming.token,
        uid: incoming.uid,
      });
      setJoined(false); // fresh session
      setPhase("incoming");
      console.log("[CALL] incoming call set:", incoming);
    };

    socket.on("NEW_INCOMING_CALL", handleIncoming);
    socket.on("Conversation", handleIncoming);

    const handleEnded = (obj: any) => {
      const type = obj?.type ?? obj?.payload?.type ?? obj?.event;
      if (type !== "CALL_ENDED") return;

      const evt =
        (obj?.payload?.event as EndReason) ??
        (obj?.event as EndReason) ??
        "ended";

      // Treat socket as a REMOTE termination; don't ping API again.
      void end(evt, "remote");
    };
    socket.on("CALL_ENDED", handleEnded);

    return () => {
      socket.off("NEW_INCOMING_CALL", handleIncoming);
      socket.off("Conversation", handleIncoming);
      socket.off("CALL_ENDED", handleEnded);
    };
  }, [socket, end]);

  /* -----------------------------------------------------------------------------
   * Caller: seed outgoing session (state + refs) and optionally auto-join
   * --------------------------------------------------------------------------- */
  const startOutgoing = useCallback(
    (s: OutgoingSession, opts?: { autoJoinCaller?: boolean }) => {
      setRole("caller");
      setCallId(s.callId);
      setChannel(s.channel);
      setToken(s.token);
      setUid(Number(s.uid));
      setRemoteName(s.name || "Unknown");
      setRemoteImage(s.image);
      setJoinParams({ channel: s.channel, token: s.token, uid: Number(s.uid) });
      setJoined(false); // fresh session
      setPhase("outgoing");
      console.log("[CALL] start outgoing:", s);

      if (opts?.autoJoinCaller) {
        void preflightAndJoin(); // will pull from refs safely
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* -----------------------------------------------------------------------------
   * Internal: (re)create + publish mic with auto-recovery handlers
   * --------------------------------------------------------------------------- */
  const recreateAndPublishMic = useCallback(
    async (
      quality: "speech_low_quality" | "speech_standard" = "speech_standard"
    ) => {
      const client = clientRef.current!;
      const old = micRef.current;
      if (old) {
        try {
          await client.unpublish([old]);
        } catch {}
        try {
          old.stop();
          old.close();
        } catch {}
      }

      const microphoneId = await getPreferredMicId();
      const mic = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: quality,
        microphoneId,
      });

      mic.on("track-ended", async () => {
        console.warn("[CALL] mic track ended — attempting auto-recovery");
        try {
          await recreateAndPublishMic(quality);
          setMuted(false);
          console.log("[CALL] mic auto-recovered and republished");
        } catch (e) {
          console.error("[CALL] mic auto-recovery failed:", e);
        }
      });

      micRef.current = mic;
      await client.publish([mic]);
      setMuted(false);
      console.log("[CALL] published local mic");
    },
    []
  );

  /* -----------------------------------------------------------------------------
   * Join core (reads params object)
   * --------------------------------------------------------------------------- */
  // Retry helper (exponential backoff) for join()
  async function joinWithRetry(
    client: IAgoraRTCClient,
    params: { appId: string; channel: string; token: string; uid: number },
    {
      attempts = 3,
      baseDelayMs = 600, // first backoff
    } = {}
  ): Promise<void> {
    let lastErr: any = null;

    for (let i = 0; i < attempts; i++) {
      try {
        await client.join(
          params.appId,
          params.channel,
          params.token,
          params.uid
        );
        return; // success
      } catch (err: any) {
        lastErr = err;

        // For any error, leave/reset before retrying (prevents half-open state)
        try {
          await client.leave();
        } catch {}

        const delay = Math.round(
          baseDelayMs * Math.pow(2, i) + Math.random() * 200
        );
        console.warn(
          `[CALL] join attempt ${i + 1} failed. Retrying in ${delay}ms…`,
          err
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastErr;
  }

  const joinWithParams = useCallback(
    async (jp: JoinParams) => {
      const { appId: a, channel: c, token: t, uid: u } = jp;
      console.log("[CALL] join with:", {
        appId: a,
        channel: c,
        uid: u,
        hasToken: !!t,
        role,
      });
      if (!a || !t || !c || u == null) {
        console.warn("[CALL] join aborted: missing params");
        return;
      }

      try {
        setPhase((p) => (p === "incoming" ? "connecting" : p));
        const client = clientRef.current!;

        await joinWithRetry(
          client,
          { appId: a, channel: c, token: t, uid: u },
          {
            attempts: 3,
            baseDelayMs: 700,
          }
        );

        console.log("[CALL] joined channel");
        await recreateAndPublishMic("speech_standard");
        setPhase("active");
      } catch (e) {
        console.error("[CALL] join/publish failed:", e);
        setPhase((p) =>
          p === "incoming"
            ? "incoming"
            : p === "outgoing"
            ? "outgoing"
            : "ended"
        );
      }
    },
    [recreateAndPublishMic, role]
  );

  /* -----------------------------------------------------------------------------
   * Public join: tries state, then refs
   * --------------------------------------------------------------------------- */
  const join = useCallback(async () => {
    const st = { appId, channel, token, uid };
    if (st.appId && st.channel && st.token && typeof st.uid === "number") {
      await joinWithParams({
        appId: st.appId,
        channel: st.channel,
        token: st.token,
        uid: st.uid,
      } as JoinParams);
      return;
    }
    const jp = joinParamsRef.current;
    if (jp) {
      await joinWithParams(jp);
      return;
    }
    console.warn("[CALL] join aborted: missing params (no state or refs)");
  }, [appId, channel, token, uid, joinWithParams]);

  /* -----------------------------------------------------------------------------
   * Preflight → ensure params → join
   *  - Callee: waits up to 5s for socket to set params
   *  - Caller: can optionally fetch session first (no race)
   * --------------------------------------------------------------------------- */
  const preflightAndJoin = useCallback(
    async (opts?: { fetchSession?: () => Promise<OutgoingSession | null> }) => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      try {
        await unlockAudioOnce();
        const ok = await requestMicPermission();
        if (!ok) {
          joinedRef.current = false;
          return;
        }

        // If provided, fetch the session (caller flow). This guarantees params.
        if (opts?.fetchSession) {
          const s = await opts.fetchSession();
          if (s && s.channel && s.token && s.uid) {
            setRole("caller");
            setCallId(s.callId);
            setChannel(s.channel);
            setToken(s.token);
            setUid(Number(s.uid));
            setRemoteName(s.name || "Unknown");
            setRemoteImage(s.image);
            setJoinParams({
              channel: s.channel,
              token: s.token,
              uid: Number(s.uid),
            });
            setJoined(false);
            setPhase("outgoing");
          }
        }

        // Wait for params from either state or refs
        const params = await waitFor<JoinParams>(() => {
          const sOk =
            appId && channel && token && typeof uid === "number"
              ? ({
                  appId,
                  channel: channel!,
                  token: token!,
                  uid: uid!,
                } as JoinParams)
              : null;
          return sOk ?? joinParamsRef.current ?? null;
        });

        if (!params) {
          console.warn("[CALL] preflight join aborted: no params available");
          joinedRef.current = false;
          return;
        }

        await joinWithParams(params);
      } catch (e) {
        console.error("[CALL] preflightAndJoin failed:", e);
        joinedRef.current = false;
      }
    },
    [appId, channel, token, uid, joinWithParams]
  );

  /**
   * Convenience: full caller flow in one call from a button:
   * - Unlock audio & get mic perm
   * - startCall (server) → map → set refs/state
   * - join
   */
  const preflightStartCallAndJoin = useCallback(
    async ({ toUser, toUserType }: MakeCallType) => {
      return preflightAndJoin({
        fetchSession: async () => {
          try {
            const res = await callApi.startCall({ toUser, toUserType });
            const s = mapCreateSessionResponseToOutgoingSession(
              res?.data ?? res,
              appId
            );
            console.log("[CALL] create-session mapped:", s);
            return s;
          } catch (e) {
            console.error("[CALL] start call error:", e);
            return null;
          }
        },
      });
    },
    [appId, preflightAndJoin]
  );

  /* -----------------------------------------------------------------------------
   * Local mute
   * --------------------------------------------------------------------------- */
  const toggleMute = useCallback(async () => {
    const mic = micRef.current;
    if (!mic) return;
    const next = !muted;
    try {
      await mic.setEnabled(!next);
      setMuted(next);
      console.log("[CALL] local mute ->", next);
    } catch (e) {
      console.warn("[CALL] toggleMute error:", e);
    }
  }, [muted]);

  /* -----------------------------------------------------------------------------
   * Optional: API helper to start a call (legacy; still exported)
   * --------------------------------------------------------------------------- */
  const handleStartCall = useCallback(
    async ({ toUser, toUserType }: MakeCallType) => {
      console.log("[CALL] starting call…");
      try {
        const res = await callApi.startCall({ toUser, toUserType });
        const session = mapCreateSessionResponseToOutgoingSession(
          res?.data ?? res,
          appId
        );
        console.log("[CALL] create-session mapped:", session);
        startOutgoing(session, { autoJoinCaller: true });
        return res;
      } catch (error: any) {
        console.error("[CALL] start call error:", error);
      }
    },
    [appId, startOutgoing]
  );

  return {
    // state
    phase,
    role,
    callId,
    channel,
    uid,
    remoteName,
    remoteImage,
    muted,
    // diagnostics
    localLevel,
    uplinkQuality,
    downlinkQuality,

    // actions / flags
    startOutgoing, // if you already have session
    join, // if you already have params
    end, // end("ended" | "missed" | "declined", "local" | "remote")
    toggleMute,
    handleStartCall, // legacy caller: start then auto-join
    preflightAndJoin, // callee: Accept OR caller with params
    preflightStartCallAndJoin, // caller: one-shot startCall → join (no race)

    // remote presence
    joined, // <-- true only when remote actually joined (published audio)
  };
}

/* =================================================================================
 * Mapping helper (caller): create-session → OutgoingSession
 * ================================================================================= */
export function mapCreateSessionResponseToOutgoingSession(
  resp: any,
  appId: string
) {
  const d = resp?.data ?? resp;
  const call = d?.call ?? d?.data?.call;
  const channelName = d?.channelName ?? call?.channel;

  return {
    appId,
    callId: call?._id,
    channel: channelName,
    token: call?.fromUserToken,
    uid: Number(call?.fromUserUid),
    name: call?.heading?.name,
    image: call?.heading?.image,
  } as const;
}
