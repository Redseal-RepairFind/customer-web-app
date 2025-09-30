// CallPortal.tsx
"use client";

import { useEffect, useRef } from "react";
import {
  FaPhone,
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaRegKeyboard,
  FaUserPlus,
  FaCog,
  FaPause,
  FaPlay,
  FaVolumeUp,
  FaChevronDown,
} from "react-icons/fa";

export type CallState =
  | "incoming"
  | "outgoing"
  | "connecting"
  | "active"
  | "on-hold"
  | "reconnecting"
  | "ended";

type ConnectionInfo = {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  networkLabel?: string;
};

type CallData = {
  callId: string;
  channel: string;
  token: string;
  uid: number;
  name: string;
  image?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;

  /** Agora/Backend state */
  state: CallState;
  role: "caller" | "callee";

  /** Tailor-made payload from your backend/event */
  data: CallData;

  /** UI state */
  muted: boolean;
  videoEnabled: boolean;
  speakerOn?: boolean;
  screenSharing?: boolean;
  onHold?: boolean;

  durationLabel?: string;
  connection?: ConnectionInfo; // kept for API compatibility (unused)

  // actions
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
  onMuteToggle?: () => void;
  onVideoToggle?: () => void;
  onSpeakerToggle?: () => void;
  onHoldToggle?: () => void;
  onShareToggle?: () => void;
  onOpenKeypad?: () => void;
  onAddParticipant?: () => void;
  onOpenSettings?: () => void;

  // Optional: render actual video elements
  renderRemoteVideo?: () => React.ReactNode;
  renderLocalPreview?: () => React.ReactNode;
};

export default function CallPortal({
  isOpen,
  onClose,
  state,
  role,
  data,
  muted,
  videoEnabled,
  speakerOn = true,
  screenSharing = false,
  onHold = false,
  durationLabel,
  connection, // eslint-disable-line @typescript-eslint/no-unused-vars
  onAccept,
  onDecline,
  onEnd,
  onMuteToggle,
  onVideoToggle,
  onSpeakerToggle,
  onHoldToggle,
  onShareToggle,
  onOpenKeypad,
  onAddParticipant,
  onOpenSettings,
  renderRemoteVideo,
  renderLocalPreview,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  console.log(data);

  // Trap focus + ESC close
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
      if (e.key.toLowerCase() === "m") onMuteToggle?.();
      if (e.key.toLowerCase() === "v") onVideoToggle?.();
      if (e.key.toLowerCase() === "h") onHoldToggle?.();
      if (e.key.toLowerCase() === "s") onShareToggle?.();
      if (e.key.toLowerCase() === "e") onEnd?.();
    };
    window.addEventListener("keydown", onKey);

    const t = setTimeout(() => {
      const btn = panelRef.current?.querySelector<HTMLElement>("button");
      btn?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [
    isOpen,
    onClose,
    onMuteToggle,
    onVideoToggle,
    onHoldToggle,
    onShareToggle,
    onEnd,
  ]);

  if (!isOpen) return null;

  const statusText = getStatusText(state, onHold, role);
  const canShowAccept = state === "incoming";
  const canShowDecline = state === "incoming";

  // Minimal dock when ringing or answered
  const showMinimalDock = [
    "outgoing",
    "connecting",
    "reconnecting",
    "active",
  ].includes(state);

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Call portal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-14 px-4 flex items-center justify-between bg-black backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={data.name} url={data.image} />
          <div className="min-w-0">
            <div className="font-semibold truncate">{data.name}</div>
            {/* Keep duration only; removed network bars/pill here */}
            {durationLabel && state === "active" && (
              <div className="text-xs text-white/70">{durationLabel}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800/70 hover:bg-neutral-800/90 border border-neutral-700/60"
            aria-label="Open settings"
          >
            <FaCog aria-hidden />
            <span className="hidden sm:inline text-sm">Settings</span>
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800/70 hover:bg-neutral-800/90 border border-neutral-700/60"
            aria-label="Minimize call"
          >
            <FaChevronDown aria-hidden />
            <span className="hidden sm:inline text-sm">Minimize</span>
          </button>
        </div>
      </div>

      {/* Main panel */}
      <div
        ref={panelRef}
        className="absolute inset-0 pt-14 pb-28 px-4 flex flex-col"
      >
        {/* Remote media area */}
        <div className="relative flex-1 rounded-2xl bg-neutral-800/50 overflow-hidden border border-neutral-700/60">
          {/* Screen share / video */}
          {/* Screen share / video */}
          <div className="absolute inset-0">
            {screenSharing ? (
              <Placeholder label="Screen sharing" />
            ) : renderRemoteVideo ? (
              renderRemoteVideo()
            ) : (
              // voice-first UI; center avatar + name + status
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Avatar size="lg" name={data.name} url={data.image} />
                  <div className="text-lg font-semibold">{data.name}</div>
                  <div className="text-sm text-white/80">{statusText}</div>
                </div>
              </div>
            )}
          </div>

          {/* Local PiP (kept for API compatibility) */}
          <div className="absolute bottom-4 right-4 w-44 h-28 rounded-lg overflow-hidden border border-neutral-600/70 bg-black backdrop-blur">
            {renderLocalPreview ? (
              renderLocalPreview()
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar name={"You"} />
              </div>
            )}
          </div>

          {/* Ribbons (outgoing / reconnecting) */}
          {["outgoing", "connecting", "reconnecting"].includes(state) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-100 text-xs border border-yellow-400/30">
              {statusText}
            </div>
          )}
        </div>

        {/* Incoming accept/decline (unchanged so flows elsewhere don't break) */}
        {canShowAccept && (
          <div className="mt-4 flex items-center justify-center gap-6">
            <CircleButton
              color="green"
              label="Accept"
              icon={<FaPhone className="-rotate-45" />}
              onClick={onAccept}
            />
            <CircleButton
              color="red"
              label="Decline"
              icon={<FaPhoneSlash />}
              onClick={onDecline || onEnd}
            />
          </div>
        )}

        {/* Minimal controls dock: only End, Mute, Speaker when ringing/answered */}
        {showMinimalDock && (
          <div className="mt-4 mx-auto w-full max-w-3xl rounded-2xl bg-neutral-800/50 border border-neutral-700/60 p-3">
            <div className="grid grid-cols-3 gap-2 place-items-center">
              <ToggleButton
                active={!muted}
                label={muted ? "Unmute" : "Mute"}
                onClick={onMuteToggle}
                onIcon={<FaMicrophone />}
                offIcon={<FaMicrophoneSlash />}
                ariaLabel="Mute or unmute microphone"
              />
              <ToggleButton
                active={speakerOn}
                label="Speaker"
                onClick={onSpeakerToggle}
                onIcon={<FaVolumeUp />}
                offIcon={<FaVolumeUp />}
                ariaLabel="Toggle speaker"
              />
              <DockButton
                label="End"
                icon={<FaPhoneSlash />}
                danger
                onClick={onEnd}
                ariaLabel="End call"
              />
            </div>
            {/* Shortcuts kept; optional */}
            <div className="mt-2 text-center text-[11px] text-white/60">
              Shortcuts:{" "}
              <kbd className="px-1 py-0.5 bg-neutral-800/70 rounded">M</kbd>{" "}
              mute ·{" "}
              <kbd className="px-1 py-0.5 bg-neutral-800/70 rounded">E</kbd> end
            </div>
          </div>
        )}

        {/* Ended footer */}
        {state === "ended" && (
          <div className="mt-4 mx-auto w-full max-w-lg text-center">
            <div className="text-white/80">Call ended</div>
            <div className="text-white/50 text-sm">
              {durationLabel ? `Duration: ${durationLabel}` : ""}
            </div>
            <div className="mt-3">
              <DockButton
                label="Close"
                icon={<FaChevronDown />}
                onClick={onClose}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string;
  size?: "md" | "lg";
}) {
  const s = size === "lg" ? "h-24 w-24 text-2xl" : "h-9 w-9 text-xs";
  if (url) {
    return (
      <div
        className={`relative ${s} rounded-full overflow-hidden bg-neutral-800/70 border border-neutral-700/60`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  const initials = name
    ?.split(" ")
    ?.map((n) => n[0])
    ?.slice(0, 2)
    ?.join("")
    ?.toUpperCase();
  return (
    <div
      className={`flex items-center justify-center ${s} rounded-full bg-neutral-800/70 border border-neutral-700/60`}
    >
      {initials || "?"}
    </div>
  );
}

function StatusPill({
  state,
  onHold,
  role,
}: {
  state: CallState;
  onHold: boolean;
  role: "caller" | "callee";
}) {
  const text = getStatusText(state, onHold, role);
  const color =
    state === "active"
      ? "bg-emerald-400/20 text-emerald-100 border-emerald-400/30"
      : state === "incoming"
      ? "bg-blue-400/20 text-blue-100 border-blue-400/30"
      : state === "outgoing"
      ? "bg-blue-400/20 text-blue-100 border-blue-400/30"
      : state === "connecting" || state === "reconnecting"
      ? "bg-yellow-400/20 text-yellow-100 border-yellow-400/30"
      : state === "ended"
      ? "bg-neutral-800/70 text-white/70 border-neutral-700/60"
      : "bg-neutral-800/70 text-white/70 border-neutral-700/60";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${color}`}>
      {text}
    </span>
  );
}

function getStatusText(
  state: CallState,
  onHold: boolean,
  role?: "caller" | "callee"
) {
  if (state === "active" && onHold) return "On hold";
  switch (state) {
    case "incoming":
      return "Incoming call";
    case "outgoing":
      return role === "caller" ? "Calling…" : "Ringing…";
    case "connecting":
      return "Connecting…";
    case "reconnecting":
      return "Reconnecting…";
    case "active":
      return "In call";
    case "ended":
      return "Ended";
    default:
      return "Call";
  }
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900/50">
      <div className="text-white/60 text-sm">{label}</div>
    </div>
  );
}

function DockButton({
  label,
  icon,
  onClick,
  danger,
  ariaLabel,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg w-full
        bg-neutral-800/50 hover:bg-neutral-800/90 border border-neutral-700/60
        ${danger ? "text-red-300 hover:text-red-200" : "text-white"}
        focus:outline-none focus:ring-2 focus:ring-neutral-700`}
    >
      <span className={`text-lg ${danger ? "text-red-400" : ""}`}>{icon}</span>
      <span className="text-[11px] opacity-80">{label}</span>
    </button>
  );
}

function CircleButton({
  color,
  label,
  icon,
  onClick,
}: {
  color: "green" | "red";
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const base =
    color === "green"
      ? "bg-emerald-500 hover:bg-emerald-400"
      : "bg-red-500 hover:bg-red-400";
  return (
    <button
      onClick={onClick}
      className={`h-16 w-16 rounded-full flex items-center justify-center ${base} shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-700`}
      aria-label={label}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  onIcon,
  offIcon,
  ariaLabel,
}: {
  active: boolean;
  label: string;
  onClick?: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      aria-pressed={active}
      className={`w-full h-16 rounded-xl px-3 flex flex-col items-center justify-center gap-1
        border transition
        ${
          active
            ? "bg-neutral-800/90 border-neutral-700/60 text-white"
            : "bg-neutral-800/50 hover:bg-neutral-800/90 border-neutral-700/60 text-white/90"
        }
        focus:outline-none focus:ring-2 focus:ring-neutral-700`}
    >
      <span className="text-lg">{active ? onIcon : offIcon}</span>
      <span className="text-[11px] opacity-80">{label}</span>
    </button>
  );
}
