// app/components/CallPortalContainer.tsx
"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import CallPortal, { CallState } from "./call-portal";
import { mapCreateSessionResponseToOutgoingSession } from "@/hook/useCall";
import { useCall } from "@/contexts/call-provider";

type Props = {
  createSessionResponse?: any | null;
  initialCountdownSec?: number; // kept for API compatibility (we count up now)
};

/* -----------------------------------------------------------------------------
 * Time formatting
 * --------------------------------------------------------------------------- */
export function formatMMSS(s: number) {
  const total = Math.max(0, Math.floor(s));
  const m = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/* -----------------------------------------------------------------------------
 * Audio helpers (ringback/ringtone) + autoplay unlocking
 * --------------------------------------------------------------------------- */
type ManagedAudio = HTMLAudioElement & { __ready?: boolean };

const RING_VOL = 0.6;
// Put your actual audio files under /public/audio/
const SRC_RINGBACK = "/audio/caller.mp3"; // caller hears this while dialing
const SRC_RINGTONE = "/audio/callee.mp3"; // callee hears this on incoming

function getOrCreateAudio(
  ref: React.MutableRefObject<ManagedAudio | null>,
  src: string,
  loop = true
) {
  if (!ref.current) {
    const el = document.createElement("audio") as ManagedAudio;
    el.src = src;
    el.preload = "auto";
    el.loop = loop;
    el.crossOrigin = "anonymous";
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.volume = RING_VOL;
    ref.current = el;
    document.body.appendChild(el);
  } else {
    const abs = new URL(src, window.location.href).href;
    if (ref.current.src !== abs) ref.current.src = src;
  }
  return ref.current!;
}

// returns true if play succeeded (not blocked by autoplay policy)
async function safePlay(el: ManagedAudio): Promise<boolean> {
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      (window as any).__globalAudioCtx =
        (window as any).__globalAudioCtx ||
        new Ctx({ latencyHint: "interactive" });
      if ((window as any).__globalAudioCtx.state === "suspended") {
        await (window as any).__globalAudioCtx.resume();
      }
    }
    await el.play();
    return true;
  } catch (e) {
    console.warn("[CALL] audio play blocked (needs gesture):", e);
    return false;
  }
}

function stopAndReset(el: ManagedAudio | null) {
  if (!el) return;
  try {
    el.pause();
  } catch {}
  try {
    el.currentTime = 0;
  } catch {}
}

/* =============================================================================
 * Component
 * =========================================================================== */
export default function CallPortalContainer({
  createSessionResponse,
  initialCountdownSec = 0,
}: Props) {
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
    joined, // remote presence (engine sets this)

    // engine actions
    startOutgoing,
    join,
    end,
    toggleMute,
  } = useCall();

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const startedRef = useRef(false);

  // Seed from createSessionResponse (outgoing path)
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
      token: "",
      uid: typeof uid === "number" ? uid : 0,
      name: remoteName || "Unknown",
      image: remoteImage,
    }),
    [callId, channel, uid, remoteName, remoteImage]
  );

  /* -----------------------------------------------------------------------------
   * ELAPSED TIMER: count up while remote present + active call
   * --------------------------------------------------------------------------- */
  const [elapsed, setElapsed] = useState<number>(0);
  const runStartRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      state === "outgoing" ||
      state === "incoming" ||
      state === "connecting"
    ) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      runStartRef.current = null;
      accumulatedRef.current = 0;
      setElapsed(0);
    }
  }, [state]);

  useEffect(() => {
    const running = joined && state === "active";
    if (running) {
      if (runStartRef.current == null) runStartRef.current = Date.now();
      if (!tickRef.current) {
        tickRef.current = window.setInterval(() => {
          const now = Date.now();
          const runSecs =
            runStartRef.current != null
              ? Math.floor((now - runStartRef.current) / 1000)
              : 0;
          setElapsed(accumulatedRef.current + runSecs);
        }, 1000);
      }
    } else {
      if (runStartRef.current != null) {
        const now = Date.now();
        accumulatedRef.current += Math.floor(
          (now - runStartRef.current) / 1000
        );
        runStartRef.current = null;
        setElapsed(accumulatedRef.current);
      }
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [joined, state]);

  const durationLabel =
    joined && state === "active" ? formatMMSS(elapsed) : undefined;

  /* -----------------------------------------------------------------------------
   * AUTOPLAY UNLOCK: first user gesture enables future audio playbacks
   * --------------------------------------------------------------------------- */
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    const unlock = async () => {
      try {
        const Ctx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          (window as any).__globalAudioCtx =
            (window as any).__globalAudioCtx ||
            new Ctx({ latencyHint: "interactive" });
          if ((window as any).__globalAudioCtx.state === "suspended") {
            await (window as any).__globalAudioCtx.resume();
          }
        }
        setAudioUnlocked(true);
      } catch {}
    };
    const once = () => {
      unlock();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", once);
      window.removeEventListener("touchstart", once);
      window.removeEventListener("mousedown", once);
      window.removeEventListener("keydown", once);
    };
    window.addEventListener("pointerdown", once, { once: true });
    window.addEventListener("touchstart", once, { once: true });
    window.addEventListener("mousedown", once, { once: true });
    window.addEventListener("keydown", once, { once: true });
    return cleanup;
  }, []);

  /* -----------------------------------------------------------------------------
   * RINGBACK (caller) & RINGTONE (callee)
   * Requirement: tones stop ONLY when BOTH parties have joined
   * --------------------------------------------------------------------------- */
  const bothJoined = state === "active" && !!joined;

  const ringbackRef = useRef<ManagedAudio | null>(null);
  const ringtoneRef = useRef<ManagedAudio | null>(null);

  const startRingback = useCallback(async () => {
    return safePlay(getOrCreateAudio(ringbackRef, SRC_RINGBACK, true));
  }, []);
  const stopRingback = useCallback(() => stopAndReset(ringbackRef.current), []);

  const [showEnableSound, setShowEnableSound] = useState(false);

  const startRingtone = useCallback(async () => {
    const ok = await safePlay(
      getOrCreateAudio(ringtoneRef, SRC_RINGTONE, true)
    );
    if (!ok) setShowEnableSound(true); // prompt user if autoplay blocked
    return ok;
  }, []);
  const stopRingtone = useCallback(() => {
    stopAndReset(ringtoneRef.current);
    setShowEnableSound(false);
  }, []);

  const enableSoundNow = useCallback(async () => {
    setShowEnableSound(false);
    const ok = await startRingtone();
    if (!ok) setShowEnableSound(true);
  }, [startRingtone]);

  // Caller ringback:
  // Play while NOT bothJoined and we are dialing/connecting OR already active but waiting for remote
  useEffect(() => {
    if (role === "caller") {
      if (
        !bothJoined &&
        (state === "outgoing" ||
          state === "connecting" ||
          state === "reconnecting" ||
          state === "active")
      ) {
        startRingback();
      } else {
        stopRingback();
      }
    } else {
      stopRingback();
    }
  }, [role, state, bothJoined, startRingback, stopRingback]);

  // Callee ringtone:
  // Play on incoming; if user accepted but remote not joined yet, keep playing until bothJoined
  useEffect(() => {
    if (role === "callee" || state === "incoming") {
      if (
        !bothJoined &&
        (state === "incoming" ||
          state === "connecting" ||
          state === "reconnecting" ||
          state === "active")
      ) {
        // Try to play; if blocked and no gesture yet, UI button will appear
        startRingtone();
      } else {
        stopRingtone();
      }
    } else {
      stopRingtone();
    }
  }, [role, state, bothJoined, startRingtone, stopRingtone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        stopRingback();
        stopRingtone();
        ringbackRef.current?.remove();
        ringtoneRef.current?.remove();
      } catch {}
      ringbackRef.current = null;
      ringtoneRef.current = null;
    };
  }, [stopRingback, stopRingtone]);

  /* -----------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------- */
  return (
    <>
      <CallPortal
        isOpen={isOpen}
        onClose={end}
        state={state}
        role={role ?? (state === "incoming" ? "callee" : "caller")}
        data={data}
        muted={muted}
        videoEnabled={false}
        speakerOn={true}
        durationLabel={durationLabel}
        onAccept={join}
        onDecline={end}
        onEnd={end}
        onMuteToggle={toggleMute}
        onSpeakerToggle={() => {}}
        onOpenSettings={() => {}}
      />

      {/* Minimal “Enable sound” affordance shown only when autoplay is blocked on callee side */}
      {showEnableSound && (
        <button
          onClick={enableSoundNow}
          className="fixed bottom-4 right-4 z-[1000] rounded-md px-3 py-2 text-sm bg-black/80 text-white shadow-lg"
        >
          Enable sound
        </button>
      )}
    </>
  );
}
