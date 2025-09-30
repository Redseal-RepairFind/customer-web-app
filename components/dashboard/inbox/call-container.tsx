// app/components/CallPortalContainer.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import CallPortal, { CallState } from "./call-portal";
import { mapCreateSessionResponseToOutgoingSession } from "@/hook/useCall";
import { useUser } from "@/hook/useMe";
import { useCall } from "@/contexts/call-provider";

type Props = { createSessionResponse?: any | null };

export default function CallPortalContainer({ createSessionResponse }: Props) {
  const {
    // engine state (from provider)
    phase,
    role,
    callId,
    channel,
    uid,
    remoteName,
    remoteImage,
    muted,
    // engine actions
    startOutgoing,
    join,
    end,
    toggleMute,
  } = useCall(); // <-- THIS is the shared engine

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  // const { curUser } = useUser();
  const startedRef = useRef(false);

  // Only if you pass createSessionResponse via props (optional path)
  useEffect(() => {
    if (!createSessionResponse || startedRef.current) return;
    const s = mapCreateSessionResponseToOutgoingSession(
      createSessionResponse?.data ?? createSessionResponse,
      appId
    );
    if (s?.callId && s?.channel && s?.token && typeof s?.uid === "number") {
      startOutgoing(s);
      startedRef.current = true;
    }
  }, [createSessionResponse, appId, startOutgoing]);

  const isOpen = phase !== "idle";

  const state: CallState =
    phase === "incoming"
      ? "incoming"
      : phase === "outgoing"
      ? "outgoing"
      : phase === "connecting"
      ? "connecting"
      : phase === "active"
      ? "active"
      : phase === "reconnecting"
      ? "reconnecting"
      : phase === "on-hold"
      ? "on-hold"
      : phase === "ended"
      ? "ended"
      : "ended";

  const data = useMemo(
    () => ({
      callId: callId ?? "",
      channel: channel ?? "",
      token: "", // portal UI doesn’t need it
      uid: typeof uid === "number" ? uid : 0,
      name: remoteName || "Unknown",
      image: remoteImage,
    }),
    [callId, channel, uid, remoteName, remoteImage]
  );

  return (
    <CallPortal
      isOpen={isOpen}
      onClose={end}
      state={state}
      role={role ?? "caller"}
      data={data}
      muted={muted}
      videoEnabled={false}
      speakerOn={true}
      onHold={false}
      screenSharing={false}
      durationLabel={undefined}
      connection={{ quality: 4, networkLabel: "Good" }}
      onAccept={join}
      onDecline={end}
      onEnd={end}
      onMuteToggle={toggleMute}
      onVideoToggle={() => {}}
      onSpeakerToggle={() => {}}
      onHoldToggle={() => {}}
      onShareToggle={() => {}}
      onOpenKeypad={() => {}}
      onAddParticipant={() => {}}
      onOpenSettings={() => {}}
    />
  );
}
