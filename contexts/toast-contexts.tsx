"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "warning" | "info";
type ToastID = string;

export type ToastVars = {
  bg?: string;
  fg?: string;
  muted?: string;
  successBg?: string;
  successBrd?: string;
  successFg?: string;
  errorBg?: string;
  errorBrd?: string;
  errorFg?: string;
  warningBg?: string;
  warningBrd?: string;
  warningFg?: string;
  radius?: string;
  shadow?: string;
};

type ToastPlacement =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

function toCSSVars(v?: ToastVars): React.CSSProperties {
  if (!v) return {};
  const map: Record<keyof ToastVars, string> = {
    bg: "--toast-bg",
    fg: "--toast-fg",
    muted: "--toast-muted",
    successBg: "--toast-success-bg",
    successBrd: "--toast-success-brd",
    successFg: "--toast-success-fg",
    errorBg: "--toast-error-bg",
    errorBrd: "--toast-error-brd",
    errorFg: "--toast-error-fg",
    warningBg: "--toast-warning-bg",
    warningBrd: "--toast-warning-brd",
    warningFg: "--toast-warning-fg",
    radius: "--toast-radius",
    shadow: "--toast-shadow",
  };
  const out: React.CSSProperties = {};
  for (const k in v) {
    const cssVar = map[k as keyof ToastVars];
    const val = (v as any)[k];
    if (cssVar && val != null) (out as any)[cssVar] = val;
  }
  return out;
}

/** Promote generic bg/fg into the active variant’s vars for this item */
function toItemStyle(
  vars: ToastVars | undefined,
  variant: ToastVariant
): React.CSSProperties {
  if (!vars) return {};
  const base = toCSSVars(vars) as Record<string, string>;

  const vkey = variant as "success" | "error" | "warning" | "info";
  const bgKey = `--toast-${vkey}-bg`;
  const fgKey = `--toast-${vkey}-fg`;
  const brdKey = `--toast-${vkey}-brd`;

  if (vars.bg != null && base[bgKey] == null) base[bgKey] = vars.bg;
  if (vars.fg != null && base[fgKey] == null) base[fgKey] = vars.fg;
  if ((vars as any).brd != null && base[brdKey] == null)
    base[brdKey] = (vars as any).brd;

  return base as React.CSSProperties;
}

/** ===== Public API ===== */
export type ToastOptions = {
  id?: ToastID;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;

  content?: ReactNode;
  render?: (api: ToastRenderApi) => ReactNode;
  role?: "status" | "alert";
  className?: string;
  style?: React.CSSProperties;
  vars?: ToastVars;
};

type ToastInternal = Required<
  Omit<
    ToastOptions,
    "onAction" | "content" | "render" | "role" | "className" | "style" | "vars"
  >
> & {
  onAction?: () => void;
  content?: ReactNode;
  render?: (api: ToastRenderApi) => ReactNode;
  role?: "status" | "alert";
  className?: string;
  style?: React.CSSProperties;
  vars?: ToastVars;
  createdAt: number;
  closing?: boolean;
};

export type ToastRenderApi = {
  id: ToastID;
  variant: ToastVariant;
  title?: string;
  description?: string;
  dismiss: () => void;
  pause: () => void;
  resume: () => void;
  createdAt: number;
};

type ToastContextValue = {
  toast: (opts: ToastOptions | string) => ToastID;
  success: (opts: ToastOptions | string) => ToastID;
  error: (opts: ToastOptions | string) => ToastID;
  warning: (opts: ToastOptions | string) => ToastID;
  info: (opts: ToastOptions | string) => ToastID;
  dismiss: (id: ToastID) => void;
  clearAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const DEFAULT_DURATION = 4000;
const EXIT_MS = 200;

export function ToastProvider({
  children,
  theme,
  placement = "top-center",
}: {
  children: React.ReactNode;
  theme?: ToastVars;
  placement?: ToastPlacement;
}) {
  const [items, setItems] = useState<ToastInternal[]>([]);
  const timers = useRef<
    Map<string, { timeout?: number; remaining: number; start: number }>
  >(new Map());

  const scheduleTimer = useCallback((id: string, duration: number) => {
    const t = timers.current.get(id);
    if (t?.timeout) window.clearTimeout(t.timeout);
    const start = Date.now();
    const timeout = window.setTimeout(() => {
      // animate out then remove
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, closing: true } : i))
      );
      window.setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        timers.current.delete(id);
      }, EXIT_MS);
    }, duration);
    timers.current.set(id, { timeout, remaining: duration, start });
  }, []);

  const add = useCallback(
    (opts: ToastOptions | string, defaultVariant: ToastVariant = "info") => {
      const base: ToastOptions =
        typeof opts === "string" ? { title: opts } : opts;
      const id = base.id ?? uid();

      setItems((prev) => {
        const exists = prev.find((i) => i.id === id);
        const next: ToastInternal = {
          id,
          title: base.title ?? exists?.title ?? "",
          description: base.description ?? exists?.description ?? "",
          variant: base.variant ?? exists?.variant ?? defaultVariant,
          duration: base.duration ?? exists?.duration ?? DEFAULT_DURATION,
          actionLabel: base.actionLabel ?? exists?.actionLabel ?? "",
          onAction: base.onAction ?? exists?.onAction,
          content: base.content ?? exists?.content,
          render: base.render ?? exists?.render,
          role: base.role ?? exists?.role,
          className: base.className ?? exists?.className,
          style: base.style ?? exists?.style,
          vars: base.vars ?? exists?.vars,
          createdAt: exists?.createdAt ?? Date.now(),
          closing: false,
        };
        const others = prev.filter((i) => i.id !== id);
        return [next, ...others];
      });

      const mergedDuration =
        (typeof base !== "string" && base.duration != null
          ? base.duration
          : undefined) ?? DEFAULT_DURATION;

      if (mergedDuration > 0) scheduleTimer(id, mergedDuration);
      return id;
    },
    [scheduleTimer]
  );

  const dismissAnimated = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, closing: true } : i))
    );
    const t = timers.current.get(id);
    if (t?.timeout) window.clearTimeout(t.timeout);
    timers.current.delete(id);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, EXIT_MS);
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach((t) => t.timeout && window.clearTimeout(t.timeout));
    timers.current.clear();
    setItems((prev) => prev.map((i) => ({ ...i, closing: true })));
    window.setTimeout(() => setItems([]), EXIT_MS);
  }, []);

  const pause = (id: string) => {
    const t = timers.current.get(id);
    if (!t?.timeout) return;
    window.clearTimeout(t.timeout);
    t.remaining = t.remaining - (Date.now() - t.start);
    t.timeout = undefined;
    timers.current.set(id, t);
  };

  const resume = (id: string) => {
    const t = timers.current.get(id);
    if (!t) return;
    scheduleTimer(id, Math.max(0, t.remaining));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && items.length) {
        // dismiss most recent
        dismissAnimated(items[0].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, dismissAnimated]);

  const api: ToastContextValue = useMemo(
    () => ({
      toast: (o) => add(o, "info"),
      info: (o) => add(o, "info"),
      success: (o) => add(o, "success"),
      error: (o) => add(o, "error"),
      warning: (o) => add(o, "warning"),
      dismiss: dismissAnimated,
      clearAll,
    }),
    [add, dismissAnimated, clearAll]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        {/* App-wide theme overrides via CSS vars */}
        <div data-toast-root style={toCSSVars(theme)}>
          <ToastViewport
            items={items}
            pause={pause}
            resume={resume}
            dismiss={dismissAnimated}
            placement={placement}
          />
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/** ---- Portal ---- */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setMounted(true);
    if (!elRef.current) {
      const el = document.createElement("div");
      el.setAttribute("data-toast-portal", "true");
      document.body.appendChild(el);
      elRef.current = el;
    }
    return () => {
      if (elRef.current) document.body.removeChild(elRef.current);
      elRef.current = null;
    };
  }, []);
  if (!mounted || !elRef.current) return null;
  return createPortal(children, elRef.current);
}

/** ---- Icon ---- */
function Icon({ variant }: { variant: ToastVariant }) {
  const path =
    variant === "success"
      ? "M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z"
      : variant === "error"
      ? "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z"
      : variant === "warning"
      ? "M1 21h22L12 2 1 21zm11-3a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-1-5V9h2v4h-2z"
      : "M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z";
  return (
    <svg viewBox="0 0 24 24" className="toast-icon" aria-hidden>
      <path d={path} />
    </svg>
  );
}

/** ---- Viewport / List ---- */
function ToastViewport({
  items,
  pause,
  resume,
  dismiss,
  placement,
}: {
  items: ToastInternal[];
  pause: (id: string) => void;
  resume: (id: string) => void;
  dismiss: (id: string) => void;
  placement: ToastPlacement;
}) {
  const pad = 16;
  const pos: React.CSSProperties = (() => {
    switch (placement) {
      case "top-center":
        return {
          top: pad,
          bottom: "auto",
          left: "50%",
          right: "auto",
          transform: "translateX(-50%)",
        };
      case "bottom-center":
        return {
          bottom: pad,
          top: "auto",
          left: "50%",
          right: "auto",
          transform: "translateX(-50%)",
        };
      case "top-left":
        return { top: pad, bottom: "auto", left: pad, right: "auto" };
      case "bottom-left":
        return { bottom: pad, top: "auto", left: pad, right: "auto" };
      case "bottom-right":
        return { bottom: pad, top: "auto", right: pad, left: "auto" };
      case "top-right":
      default:
        return { top: pad, bottom: "auto", right: pad, left: "auto" };
    }
  })();

  return (
    <ol
      className="toast-viewport"
      style={pos}
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => {
        const role =
          item.role ??
          (item.variant === "error" || item.variant === "warning"
            ? "alert"
            : "status");

        // Custom renderer path
        if (item.render) {
          const api: ToastRenderApi = {
            id: item.id,
            variant: item.variant,
            title: item.title,
            description: item.description,
            dismiss: () => dismiss(item.id),
            pause: () => pause(item.id),
            resume: () => resume(item.id),
            createdAt: item.createdAt,
          };
          return (
            <li
              key={item.id}
              role={role}
              className={`toast ${item.className ?? ""}`}
              data-variant={item.variant}
              data-state={item.closing ? "closing" : "open"}
              style={{ ...toItemStyle(item.vars, item.variant), ...item.style }}
              onMouseEnter={() => pause(item.id)}
              onMouseLeave={() => resume(item.id)}
            >
              {item.render(api)}
              <button
                className="toast-close"
                aria-label="Dismiss notification"
                onClick={() => dismiss(item.id)}
              >
                <svg viewBox="0 0 24 24" className="toast-icon" aria-hidden>
                  <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29 10.59 10.59 16.89 4.29z" />
                </svg>
              </button>
            </li>
          );
        }

        // Default chrome
        return (
          <li
            key={item.id}
            role={role}
            className={`toast ${item.className ?? ""}`}
            data-variant={item.variant}
            data-state={item.closing ? "closing" : "open"}
            style={{ ...toItemStyle(item.vars, item.variant), ...item.style }}
            onMouseEnter={() => pause(item.id)}
            onMouseLeave={() => resume(item.id)}
          >
            <span className="toast-leading">
              <Icon variant={item.variant} />
            </span>

            <div className="toast-content">
              {item.content ? (
                item.content
              ) : (
                <>
                  {item.title ? (
                    <div className="toast-title">{item.title}</div>
                  ) : null}
                  {item.description ? (
                    <div className="toast-description">{item.description}</div>
                  ) : null}
                  {item.actionLabel && item.onAction && (
                    <button
                      className="toast-action"
                      onClick={() => {
                        try {
                          item.onAction?.();
                        } finally {
                          dismiss(item.id);
                        }
                      }}
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </>
              )}
            </div>

            <button
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(item.id)}
            >
              <svg viewBox="0 0 24 24" className="toast-icon" aria-hidden>
                <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29 10.59 10.59 16.89 4.29z" />
              </svg>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
