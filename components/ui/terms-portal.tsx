// components/PortalModal.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CgClose } from "react-icons/cg";

type PortalModalProps = {
  isOpen: boolean;
  onClose: () => void;

  /** Optional a11y labels */
  title?: string;
  ariaLabel?: string;
  ariaDescription?: string;

  /** Behavior */
  closeOnBackdrop?: boolean; // default: true
  closeOnEsc?: boolean; // default: true

  /** Optional slots */
  header?: React.ReactNode;
  footer?: React.ReactNode;

  /** Focus mgmt */
  initialFocusRef?: React.RefObject<HTMLElement>;

  /** Content */
  children?: React.ReactNode;

  /** Extra classes for the modal panel (white bg is enforced) */
  className?: string;
};

export default function PortalModal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  ariaDescription,
  closeOnBackdrop = true,
  closeOnEsc = true,
  header,
  footer,
  initialFocusRef,
  children,
  className = "",
}: PortalModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Create a portal root (SSR-safe)
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  // Focus trap + initial focus
  useEffect(() => {
    if (!isOpen) return;

    // initial focus
    const toFocus =
      initialFocusRef?.current ??
      panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ??
      panelRef.current;
    toFocus?.focus();

    // simple focus trap
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !panelRef.current?.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    panelRef.current?.addEventListener("keydown", onKeyDown);
    return () => panelRef.current?.removeEventListener("keydown", onKeyDown);
  }, [isOpen, initialFocusRef]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      aria-hidden={false}
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title || "Modal dialog"}
        // aria-description={ariaDescription}
        className={[
          // Size & layout
          "relative w-[90vw] h-[90vh] max-w-[1600px] max-h-[95vh]",
          // Strict white panel
          "bg-white text-neutral-900",
          "rounded-2xl shadow-2xl border border-neutral-200",
          "flex flex-col overflow-hidden",
          // Subtle animation
          "animate-in fade-in zoom-in duration-150",
          className,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white">
          <div className="min-w-0">
            {header ?? (
              <h2 className="text-base font-semibold truncate text-neutral-900">
                {title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-900 cursor-pointer"
          >
            <CgClose size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 bg-white">{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
