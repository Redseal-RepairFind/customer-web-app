// app/hooks/useCallEngine.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  IRemoteAudioTrack,
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
  token: string; // caller token
  uid: number; // caller uid
  name?: string;
  image?: string;
};

/* =================================================================================
 * Helpers (iPad/Safari)
 * ================================================================================= */

/** Resume a shared AudioContext so autoplay works on iOS/iPadOS Safari. */
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

/** Ask explicitly for mic permission so prompt shows on a user gesture. */
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

/* =================================================================================
 * Hook
 * ================================================================================= */

export function useCallEngine(appId: string) {
  const { socket } = useSocket();

  // Agora refs
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<ILocalAudioTrack | null>(null);
  const remoteAudioRef = useRef<Map<number, IRemoteAudioTrack>>(new Map());
  const wiredRef = useRef(false); // wire client listeners once
  const joinedRef = useRef(false); // prevent duplicate joins

  // Engine state
  const [phase, setPhase] = useState<Phase>("idle");
  const [role, setRole] = useState<Role | null>(null);

  const [callId, setCallId] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);

  const [remoteName, setRemoteName] = useState<string>("Unknown");
  const [remoteImage, setRemoteImage] = useState<string | undefined>();
  const [muted, setMuted] = useState(false);

  /* -----------------------------------------------------------------------------
   * Init Agora client once + events
   * --------------------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;
    console.log("[CALL] Agora client created");

    if (wiredRef.current) return;
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

    client.on("exception", (e) => console.warn("[CALL] Agora exception:", e));

    // Remote audio subscribe & play via explicit <audio> for iOS
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
            remoteAudioRef.current.set(user.uid as number, track);
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
    });

    client.on("token-privilege-will-expire", () =>
      console.warn("[CALL] token will expire soon")
    );
    client.on("token-privilege-did-expire", () =>
      console.error("[CALL] token expired")
    );

    return () => {
      client.removeAllListeners();
      clientRef.current = null;
      console.log("[CALL] Agora client disposed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once

  /* -----------------------------------------------------------------------------
   * Cleanup (unpublish → stop/close → remove remote audios → leave)
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

      await client?.leave();
      console.log("[CALL] left channel & cleaned up");
    } catch (err) {
      console.warn("[CALL] cleanup error:", err);
    } finally {
      joinedRef.current = false;
    }
  }, []);

  const end = useCallback(async () => {
    try {
      await cleanup();
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
      }, 400);
    }
  }, [cleanup]);

  /* -----------------------------------------------------------------------------
   * Socket: NEW_INCOMING_CALL → seed callee
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
        token: p?.token, // callee token
        uid: Number(p?.uid), // callee uid
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
      setPhase("incoming");
      console.log("[CALL] incoming call set:", incoming);
    };

    socket.on("NEW_INCOMING_CALL", handleIncoming);
    socket.on("Conversation", handleIncoming); // some servers

    const handleEnded = (obj: any) => {
      const type = obj?.type ?? obj?.payload?.type;
      if (type !== "CALL_ENDED") return;
      // If we’re actively joining/active, you may choose to ignore server-ended for a moment:
      if (phase === "active" || phase === "connecting") {
        console.log("[CALL] ignoring CALL_ENDED during join/active");
        return;
      }
      end();
    };
    socket.on("CALL_ENDED", handleEnded);

    return () => {
      socket.off("NEW_INCOMING_CALL", handleIncoming);
      socket.off("Conversation", handleIncoming);
      socket.off("CALL_ENDED", handleEnded);
    };
  }, [socket, end, phase]);

  /* -----------------------------------------------------------------------------
   * Caller: seed outgoing session
   * --------------------------------------------------------------------------- */
  const startOutgoing = useCallback(
    (s: OutgoingSession, opts?: { autoJoinCaller?: boolean }) => {
      setRole("caller");
      setCallId(s.callId);
      setChannel(s.channel);
      setToken(s.token); // caller token
      setUid(Number(s.uid)); // caller uid
      setRemoteName(s.name || "Unknown");
      setRemoteImage(s.image);
      setPhase("outgoing");
      console.log("[CALL] start outgoing:", s);

      // Optional: auto-join caller if startOutgoing was triggered by a user gesture
      if (opts?.autoJoinCaller) {
        void preflightAndJoin(); // safe fire-and-forget
      }
    },
    // preflightAndJoin defined below; dependency added later via array ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* -----------------------------------------------------------------------------
   * Join (both sides). Do NOT call automatically on iPad without a tap.
   * --------------------------------------------------------------------------- */
  const join = useCallback(async () => {
    console.log("[CALL] join with:", {
      appId,
      channel,
      uid,
      hasToken: !!token,
      role,
    });
    if (!appId || !token || !channel || uid == null) {
      console.warn("[CALL] join aborted: missing params");
      return;
    }

    try {
      setPhase((p) => (p === "incoming" ? "connecting" : p));
      const client = clientRef.current!;
      await client.join(appId, channel, token, uid);
      console.log("[CALL] joined channel");

      const mic = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "speech_low_quality",
      });
      micRef.current = mic;
      await client.publish([mic]);
      console.log("[CALL] published local mic");

      setMuted(false);
      setPhase("active");
    } catch (e) {
      console.error("[CALL] join/publish failed:", e);
      // Keep user in incoming/outgoing to allow retry on iPad
      setPhase((p) =>
        p === "incoming" ? "incoming" : p === "outgoing" ? "outgoing" : "ended"
      );
    }
  }, [appId, channel, token, uid, role]);

  /* -----------------------------------------------------------------------------
   * Preflight (iOS/iPadOS): unlock audio + prompt mic, then join.
   * Call this from a BUTTON TAP (Accept/Call).
   * --------------------------------------------------------------------------- */
  const preflightAndJoin = useCallback(async () => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    try {
      await unlockAudioOnce();
      const ok = await requestMicPermission();
      if (!ok) {
        joinedRef.current = false;
        // Keep current phase so user can retry tapping Accept/Call
        return;
      }
      await join();
    } catch (e) {
      console.error("[CALL] preflightAndJoin failed:", e);
      joinedRef.current = false;
    }
  }, [join]);

  // Now that preflightAndJoin exists, patch startOutgoing deps (React rule relaxed above).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {}, [preflightAndJoin]);

  /* -----------------------------------------------------------------------------
   * End call
   * --------------------------------------------------------------------------- */

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
   * Optional: API helper to start a call (caller)
   * --------------------------------------------------------------------------- */
  const handleStartCall = async ({ toUser, toUserType }: MakeCallType) => {
    console.log("[CALL] starting call…");
    try {
      const res = await callApi.startCall({ toUser, toUserType });
      const session = mapCreateSessionResponseToOutgoingSession(
        res?.data ?? res,
        appId
      );
      console.log("[CALL] create-session mapped:", session);
      // You can set autoJoinCaller: true if this handler is invoked by a button tap.
      startOutgoing(session, { autoJoinCaller: true });
      return res;
    } catch (error: any) {
      console.error("[CALL] start call error:", error);
    }
  };

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

    // actions
    startOutgoing,
    join,
    end,
    toggleMute,
    handleStartCall,
    preflightAndJoin, // <-- use this for iPad: Accept/Call button should trigger this
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
    token: call?.fromUserToken, // caller token
    uid: Number(call?.fromUserUid), // caller uid
    name: call?.heading?.name,
    image: call?.heading?.image,
  } as const;
}
