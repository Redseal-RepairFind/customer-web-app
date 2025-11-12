"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PlayOpts = { rate?: number; volume?: number };

type Ctx = {
  play: (opts?: PlayOpts) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
};

const NotificationSoundContext = createContext<Ctx | null>(null);

export const NotificationSoundProvider: React.FC<{
  /** Path under /public, e.g. "/sounds/notify.mp3" */
  src?: string;
  children: React.ReactNode;
}> = ({ src = "/sounds/notification.mp3", children }) => {
  // persist settings
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("notif:enabled") !== "0";
  });
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 0.8;
    const v = Number(localStorage.getItem("notif:volume"));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.8;
  });

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("notif:enabled", enabled ? "1" : "0");
  }, [enabled]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("notif:volume", String(volume));
  }, [volume]);

  // Small audio pool for overlapping plays & lower latency
  const poolRef = useRef<HTMLAudioElement[]>([]);
  const readyRef = useRef(false);

  useEffect(() => {
    if (readyRef.current) return;
    const make = () => {
      const a = new Audio(src);
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      return a;
    };
    poolRef.current = [make(), make(), make()];
    readyRef.current = true;
  }, [src]);

  // Unlock on first user gesture (required on iOS)
  useEffect(() => {
    const unlock = async () => {
      try {
        const a = poolRef.current[0];
        if (!a) return;
        a.muted = true;
        a.currentTime = 0;
        await a.play();
        a.pause();
        a.muted = false;
        a.currentTime = 0;
      } catch {}
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const play = useCallback(
    (opts?: PlayOpts) => {
      if (!enabled) return;
      const { rate = 1, volume: v } = opts ?? {};
      const a =
        poolRef.current.find((x) => x.paused) ?? poolRef.current[0] ?? null;
      if (!a) return;
      a.playbackRate = rate;
      a.volume = v ?? volume;
      try {
        a.currentTime = 0;
        void a.play();
      } catch {}
    },
    [enabled, volume]
  );

  const value = useMemo<Ctx>(
    () => ({ play, enabled, setEnabled, volume, setVolume }),
    [play, enabled, volume]
  );

  return (
    <NotificationSoundContext.Provider value={value}>
      {children}
    </NotificationSoundContext.Provider>
  );
};

export const useNotificationSound = () => {
  const ctx = useContext(NotificationSoundContext);
  if (!ctx)
    throw new Error(
      "useNotificationSound must be used within NotificationSoundProvider"
    );
  return ctx;
};
