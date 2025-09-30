// app/hooks/useCallEngine.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { useSocket } from "@/contexts/socket-contexts";
import { CallState } from "@/components/dashboard/inbox/call-portal";
import { callApi } from "@/lib/api/actions/dashboard-actions/inbox-calls/calls";
import { MakeCallType } from "@/utils/types";

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

export function useCallEngine(appId: string) {
  const { socket } = useSocket();

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<ILocalAudioTrack | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [role, setRole] = useState<Role | null>(null);

  const [callId, setCallId] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);

  const [remoteName, setRemoteName] = useState<string>("Unknown");
  const [remoteImage, setRemoteImage] = useState<string | undefined>();
  const [muted, setMuted] = useState(false);

  // Init Agora client once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = c;

    const onConn = (cur: string) => {
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
    };
    c.on("connection-state-change", onConn);

    return () => {
      c.off("connection-state-change", onConn);
      clientRef.current = null;
    };
  }, [phase]);

  const cleanup = useCallback(async () => {
    try {
      if (micRef.current) {
        micRef.current.stop();
        micRef.current.close();
        micRef.current = null;
      }
      await clientRef.current?.leave();
    } catch {}
  }, []);

  // Socket: normalize and handle NEW_INCOMING_CALL
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (obj: any) => {
      // supports both direct and nested payloads
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
      )
        return;

      setRole("callee");
      setCallId(incoming.callId);
      setChannel(incoming.channel);
      setToken(incoming.token);
      setUid(incoming.uid);
      setRemoteName(incoming.name || "Unknown");
      setRemoteImage(incoming.image);
      setPhase("incoming");
    };

    socket.on("NEW_INCOMING_CALL", handleIncoming);
    socket.on("Conversation", handleIncoming);

    // optional: end events from backend
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
  }, [socket]);

  // Caller: feed the create-session response
  const startOutgoing = useCallback((s: OutgoingSession) => {
    setRole("caller");
    setCallId(s.callId);
    setChannel(s.channel);
    setToken(s.token);
    setUid(Number(s.uid));
    setRemoteName(s.name || "Unknown");
    setRemoteImage(s.image);
    setPhase("outgoing");
  }, []);

  // Join (accept for callee, confirm for caller)
  const join = useCallback(async () => {
    if (!appId || !token || !channel || uid == null) return;
    setPhase((p) => (p === "incoming" ? "connecting" : p));
    const client = clientRef.current!;
    await client.join(appId, channel, token, uid);
    const mic = await AgoraRTC.createMicrophoneAudioTrack();
    micRef.current = mic;
    await client.publish(mic);
    setMuted(false);
    setPhase("active");
  }, [appId, channel, token, uid]);

  const end = useCallback(async () => {
    await cleanup();
    setPhase("ended");
    setTimeout(() => {
      // reset a bit later to allow "Ended" UI
      setPhase("idle");
      setRole(null);
      setCallId(null);
      setChannel(null);
      setToken(null);
      setUid(null);
      setRemoteName("Unknown");
      setRemoteImage(undefined);
      setMuted(false);
    }, 500);
  }, [cleanup]);

  const toggleMute = useCallback(async () => {
    const mic = micRef.current;
    if (!mic) return;
    const target = !muted;
    await mic.setEnabled(!target);
    setMuted(target);
  }, [muted]);

  const handleStartCall = async ({ toUser, toUserType }: MakeCallType) => {
    console.log("starting call...");
    try {
      const res = await callApi.startCall({
        toUser,
        toUserType,
      });

      const session = mapCreateSessionResponseToOutgoingSession(
        res?.data ?? res,
        appId
      );

      console.log(session, res);
      startOutgoing(session);
      return res;
    } catch (error: any) {
      console.error("call start error:", error);
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
  };
}

// helper: map YOUR backend create-session response into OutgoingSession
export function mapCreateSessionResponseToOutgoingSession(
  resp: any,
  appId: string
) {
  const d = resp?.data ?? resp; // supports axios shape
  const call = d?.call ?? d?.data?.call;
  const channelName = d?.channelName ?? call?.channel;
  return {
    appId,
    callId: call?._id,
    channel: channelName,
    token: call?.fromUserToken, // caller uses fromUserToken
    uid: Number(call?.fromUserUid), // caller uid
    name: call?.heading?.name,
    image: call?.heading?.image,
  } as const;
}
