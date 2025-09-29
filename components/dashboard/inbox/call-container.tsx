// app/components/CallPortalContainer.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import CallPortal, { CallState } from "./call-portal";
import {
  useCallEngine,
  mapCreateSessionResponseToOutgoingSession,
} from "@/hook/useCall";
import { useUser } from "@/hook/useMe";

type Props = {
  createSessionResponse?: any | null;
};

export default function CallPortalContainer({ createSessionResponse }: Props) {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const {
    // engine state
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
  } = useCallEngine(appId);

  const { curUser } = useUser();
  const startedRef = useRef(false);

  // Auto-start caller flow exactly once when a create-session payload is provided
  useEffect(() => {
    if (!createSessionResponse || startedRef.current) return;
    const s = mapCreateSessionResponseToOutgoingSession(
      createSessionResponse?.data ?? createSessionResponse,
      appId
    );
    // Only start if the payload actually has what we need
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

  // Tailored call data for the CallPortal (uses your backend/event fields)
  const data = useMemo(
    () => ({
      callId: callId ?? "",
      channel: channel ?? "",
      token: "", // not needed by the portal UI; the engine uses it internally
      uid: typeof uid === "number" ? uid : 0,
      name: remoteName || "Unknown",
      image: remoteImage,
    }),
    [callId, channel, uid, remoteName, remoteImage]
  );

  // If you want to show your own avatar in the local PiP later, it’s available:
  const meAvatar = curUser?.data?.avatar as string | undefined;

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
      onAccept={join} // callee accepts OR caller confirms -> join Agora
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
      // If you later render real <video> elements from the SDK:
      // renderRemoteVideo={() => <YourRemoteVideo />}
      // renderLocalPreview={() => <YourLocalPreview avatar={meAvatar} />}
    />
  );
}
