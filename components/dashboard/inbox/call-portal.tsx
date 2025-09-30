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
  FaWifi,
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
  connection?: ConnectionInfo;

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
  connection,
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

  const statusText = getStatusText(state, onHold);
  const canShowAccept = state === "incoming";
  const canShowDecline = state === "incoming";
  const canShowStandardDock = [
    "active",
    "on-hold",
    "connecting",
    "reconnecting",
    "outgoing",
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
            <div className="text-xs text-white/70 flex items-center gap-2">
              <StatusPill state={state} onHold={onHold} role={role} />
              {durationLabel && state === "active" && (
                <span>• {durationLabel}</span>
              )}
              {!!connection && (
                <>
                  <span>•</span>
                  <Quality
                    quality={connection.quality}
                    label={connection.networkLabel}
                  />
                </>
              )}
            </div>
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
          <div className="absolute inset-0">
            {screenSharing ? (
              <Placeholder label="Screen sharing" />
            ) : renderRemoteVideo ? (
              renderRemoteVideo()
            ) : (
              // voice-first UI; show avatar/status
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Avatar size="lg" name={data.name} url={data.image} />
                  <div className="text-sm text-white/80">{statusText}</div>
                </div>
              </div>
            )}
          </div>

          {/* Local PiP */}
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

        {/* Incoming accept/decline */}
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

        {/* Controls dock */}
        {canShowStandardDock && (
          <div className="mt-4 mx-auto w-full max-w-3xl rounded-2xl bg-neutral-800/50 border border-neutral-700/60 p-3">
            <div className="grid grid-cols-8 gap-2 place-items-center">
              <ToggleButton
                active={!muted}
                label={muted ? "Unmute" : "Mute"}
                onClick={onMuteToggle}
                onIcon={<FaMicrophone />}
                offIcon={<FaMicrophoneSlash />}
                ariaLabel="Mute or unmute microphone"
              />
              <ToggleButton
                active={false /* voice-first */}
                label="Video"
                onClick={onVideoToggle}
                onIcon={<FaVideo />}
                offIcon={<FaVideoSlash />}
                ariaLabel="Toggle camera"
              />
              <ToggleButton
                active={speakerOn}
                label="Speaker"
                onClick={onSpeakerToggle}
                onIcon={<FaVolumeUp />}
                offIcon={<FaVolumeUp />}
                ariaLabel="Toggle speaker"
              />
              <ToggleButton
                active={!!onHold}
                label={onHold ? "Resume" : "Hold"}
                onClick={onHoldToggle}
                onIcon={<FaPause />}
                offIcon={<FaPlay />}
                ariaLabel="Hold or resume"
              />
              <ToggleButton
                active={screenSharing}
                label="Share"
                onClick={onShareToggle}
                onIcon={<FaDesktop />}
                offIcon={<FaDesktop />}
                ariaLabel="Toggle screen share"
              />
              <DockButton
                label="Keypad"
                icon={<FaRegKeyboard />}
                onClick={onOpenKeypad}
              />
              <DockButton
                label="Add"
                icon={<FaUserPlus />}
                onClick={onAddParticipant}
              />
              <DockButton
                label="End"
                icon={<FaPhoneSlash />}
                danger
                onClick={onEnd}
                ariaLabel="End call"
              />
            </div>
            <div className="mt-2 text-center text-[11px] text-white/60">
              Shortcuts:{" "}
              <kbd className="px-1 py-0.5 bg-neutral-800/70 rounded">M</kbd>{" "}
              mute ·{" "}
              <kbd className="px-1 py-0.5 bg-neutral-800/70 rounded">V</kbd>{" "}
              video ·{" "}
              <kbd className="px-1 py-0.5 bg-neutral-800/70 rounded">H</kbd>{" "}
              hold ·{" "}
              <kbd className="px-1 py-0.5 bg-neutral-800/70 rounded">S</kbd>{" "}
              share ·{" "}
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

function Quality({
  quality,
  label,
}: {
  quality: ConnectionInfo["quality"];
  label?: string;
}) {
  const bars = [1, 2, 3, 4, 5];
  return (
    <span className="inline-flex items-center gap-1">
      <FaWifi className="opacity-80" />
      <span className="flex gap-0.5">
        {bars.map((b) => (
          <span
            key={b}
            className={`h-2 w-1.5 rounded-sm ${
              quality >= b ? "bg-green-400" : "bg-neutral-700"
            }`}
          />
        ))}
      </span>
      {label && <span className="text-white/70">{label}</span>}
    </span>
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
