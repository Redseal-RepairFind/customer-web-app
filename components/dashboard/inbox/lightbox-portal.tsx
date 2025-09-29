import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const PortalModal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const el = panelRef.current;
    const focusable = el.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    focusable?.focus();
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onMouseDown={(e) => {
        // click outside to close
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="relative max-h-[90vh] max-w-[90vw] w-auto outline-none"
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/90 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default PortalModal;
