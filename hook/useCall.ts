// app/hooks/useCallEngine.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  IRemoteAudioTrack,
  IRemoteUser,
} from "agora-rtc-sdk-ng";
import { useSocket } from "@/contexts/socket-contexts";
import { CallState } from "@/components/dashboard/inbox/call-portal";
import { callApi } from "@/lib/api/actions/dashboard-actions/inbox-calls/calls";
import { MakeCallType } from "@/utils/types";

/* --------------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------------*/

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

/* --------------------------------------------------------------------------------
 * Helpers: audio unlock + explicit mic permission
 * ------------------------------------------------------------------------------*/

/** Resume a shared AudioContext to satisfy mobile/iOS auto-play policies. */
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

/** Request mic permission explicitly to surface the browser prompt on user gesture. */
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

/* --------------------------------------------------------------------------------
 * Hook: useCallEngine
 * ------------------------------------------------------------------------------*/

export function useCallEngine(appId: string) {
  const { socket } = useSocket();

  // Agora references
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<ILocalAudioTrack | null>(null);
  const remoteAudioRef = useRef<Map<number, IRemoteAudioTrack>>(new Map());
  const wiredRef = useRef(false); // ensure we wire client listeners once

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

  /* ----------------------------------------------------------------------------
   * Init Agora client once + wire events (connection, user publish/unpublish, token)
   * --------------------------------------------------------------------------*/
  useEffect(() => {
    if (typeof window === "undefined") return;

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;
    console.log("[CALL] Agora client created");

    if (wiredRef.current) return;
    wiredRef.current = true;

    // Connection state → keep UI phase in sync
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
    });

    // Remote user published → subscribe + play audio via explicit <audio> element
    client.on(
      "user-published",
      async (user: IRemoteUser, mediaType: "audio" | "video") => {
        console.log("[CALL] user-published:", user.uid, mediaType);
        if (mediaType !== "audio") return;
        try {
          await client.subscribe(user, "audio");
          const track = user.audioTrack;
          if (track) {
            const el = document.createElement("audio");
            el.autoplay = true;
            el.playsInline = true;
            el.setAttribute("data-agora-remote", String(user.uid));
            // Keep it off-screen
            el.style.position = "fixed";
            el.style.left = "-9999px";
            document.body.appendChild(el);

            track.setVolume(100);
            track.play(el);
            remoteAudioRef.current.set(user.uid as number, track);
            console.log("[CALL] remote audio playing:", user.uid);
          }
        } catch (err) {
          console.error("[CALL] subscribe error:", err);
        }
      }
    );

    // Remote user unpublished → stop + remove element
    const removeRemoteEl = (uidNum: number) => {
      const el = document.querySelector<HTMLAudioElement>(
        `audio[data-agora-remote="${uidNum}"]`
      );
      if (el?.parentNode) el.parentNode.removeChild(el);
    };

    client.on(
      "user-unpublished",
      (user: IRemoteUser, mt: "audio" | "video") => {
        console.log("[CALL] user-unpublished:", user.uid, mt);
        const track = remoteAudioRef.current.get(user.uid as number);
        try {
          track?.stop();
        } catch {}
        remoteAudioRef.current.delete(user.uid as number);
        removeRemoteEl(user.uid as number);
      }
    );

    client.on("user-left", (user: IRemoteUser) => {
      console.log("[CALL] user-left:", user.uid);
      const track = remoteAudioRef.current.get(user.uid as number);
      try {
        track?.stop();
      } catch {}
      remoteAudioRef.current.delete(user.uid as number);
      removeRemoteEl(user.uid as number);
    });

    // Token lifecycle
    client.on("token-privilege-will-expire", () => {
      console.warn("[CALL] token will expire soon");
      // TODO: fetch & renew if you have a renew endpoint
      // const newToken = await fetch(`/api/agora/renew?channel=${channel}&uid=${uid}`).then(r => r.text());
      // await client.renewToken(newToken);
    });
    client.on("token-privilege-did-expire", () => {
      console.error("[CALL] token did expire");
      // setPhase("reconnecting"); // optional
    });

    return () => {
      client.removeAllListeners();
      clientRef.current = null;
      console.log("[CALL] Agora client disposed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once

  /* ----------------------------------------------------------------------------
   * Cleanup utility
   * --------------------------------------------------------------------------*/
  const cleanup = useCallback(async () => {
    const client = clientRef.current;
    try {
      // Unpublish local first (if still published)
      if (micRef.current && client) {
        try {
          await client.unpublish([micRef.current]);
        } catch {}
      }

      // Stop/close local mic
      if (micRef.current) {
        micRef.current.stop();
        micRef.current.close();
        micRef.current = null;
      }

      // Stop all remote tracks + remove audio elements
      remoteAudioRef.current.forEach((track, uidNum) => {
        try {
          track.stop();
        } catch {}
        const el = document.querySelector<HTMLAudioElement>(
          `audio[data-agora-remote="${uidNum}"]`
        );
        if (el?.parentNode) el.parentNode.removeChild(el);
      });
      remoteAudioRef.current.clear();

      // Leave channel
      await client?.leave();
      console.log("[CALL] left channel & cleaned up");
    } catch (err) {
      console.warn("[CALL] cleanup error:", err);
    }
  }, []);

  /* ----------------------------------------------------------------------------
   * Socket: NEW_INCOMING_CALL → seed callee state
   * --------------------------------------------------------------------------*/
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
        console.warn("[CALL] incoming event missing data:", incoming);
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
    socket.on("Conversation", handleIncoming); // some servers route via Conversation

    const handleEnded = (obj: any) => {
      const type = obj?.type ?? obj?.payload?.type;
      if (type === "CALL_ENDED") end();
    };
    socket.on("CALL_ENDED", handleEnded);

    return () => {
      socket.off("NEW_INCOMING_CALL", handleIncoming);
      socket.off("Conversation", handleIncoming);
      socket.off("CALL_ENDED", handleEnded);
    };
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------------------------------
   * Caller: start outgoing with mapped session
   * --------------------------------------------------------------------------*/
  const startOutgoing = useCallback((s: OutgoingSession) => {
    setRole("caller");
    setCallId(s.callId);
    setChannel(s.channel);
    setToken(s.token); // caller token
    setUid(Number(s.uid)); // caller uid
    setRemoteName(s.name || "Unknown");
    setRemoteImage(s.image);
    setPhase("outgoing");
    console.log("[CALL] start outgoing:", s);
  }, []);

  /* ----------------------------------------------------------------------------
   * Join (accept for callee / proceed for caller)
   * – Ensures audio unlock + mic permission happen on click (gesture)
   * – Joins, creates mic, publishes, lets remote audio flow via event
   * --------------------------------------------------------------------------*/
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
      // Must be called from a user gesture (Accept/Call button)
      await unlockAudioOnce();

      const ok = await requestMicPermission();
      if (!ok) {
        setPhase("ended");
        return;
      }

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
      setPhase("ended");
    }
  }, [appId, channel, token, uid, role]);

  /* ----------------------------------------------------------------------------
   * End call (unpublish → close → remove audios → leave → reset)
   * --------------------------------------------------------------------------*/
  const end = useCallback(async () => {
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
      console.log("[CALL] left channel");
    } catch (err) {
      console.warn("[CALL] end error:", err);
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
  }, []);

  /* ----------------------------------------------------------------------------
   * Local mute toggle
   * --------------------------------------------------------------------------*/
  const toggleMute = useCallback(async () => {
    const mic = micRef.current;
    if (!mic) return;
    const nextMuted = !muted;
    try {
      await mic.setEnabled(!nextMuted);
      setMuted(nextMuted);
      console.log("[CALL] local mute ->", nextMuted);
    } catch (e) {
      console.warn("[CALL] toggleMute error:", e);
    }
  }, [muted]);

  /* ----------------------------------------------------------------------------
   * Optional helper: call API to start call then seed engine (caller)
   * --------------------------------------------------------------------------*/
  const handleStartCall = async ({ toUser, toUserType }: MakeCallType) => {
    console.log("[CALL] starting call…");
    try {
      const res = await callApi.startCall({ toUser, toUserType });
      const session = mapCreateSessionResponseToOutgoingSession(
        res?.data ?? res,
        appId
      );
      console.log("[CALL] create-session mapped:", session);
      startOutgoing(session);
      return res;
    } catch (error: any) {
      console.error("[CALL] start call error:", error);
    }
  };

  // Public API
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
  };
}

/* --------------------------------------------------------------------------------
 * Mapping helper (caller): from your create-session response → OutgoingSession
 * Caller must use fromUserToken/fromUserUid; channel from channelName/call.channel.
 * ------------------------------------------------------------------------------*/
export function mapCreateSessionResponseToOutgoingSession(
  resp: any,
  appId: string
) {
  const d = resp?.data ?? resp; // supports axios or raw
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
