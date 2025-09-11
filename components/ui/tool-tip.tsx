import React, {
  useId,
  useRef,
  useState,
  useEffect,
  ReactNode,
  MouseEvent,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: React.ReactElement;
  content: ReactNode;
  placement?: "top" | "bottom";
  openOn?: "hover" | "click" | "both";
}

export default function Tooltip({
  children,
  content,
  placement = "top",
  openOn = "both",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

  const hoverEnabled = openOn === "hover" || openOn === "both";
  const clickEnabled = openOn === "click" || openOn === "both";

  useEffect(() => setMounted(true), []);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: globalThis.MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Position tooltip + arrow
  useEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const gap = 10; // space between trigger and tooltip

    let top: number;
    let left: number;

    if (placement === "top") {
      top = triggerRect.top + scrollY - panelRect.height - gap;
    } else {
      top = triggerRect.bottom + scrollY + gap;
    }

    // center tooltip horizontally with trigger (clamped to viewport)
    left =
      triggerRect.left + scrollX + triggerRect.width / 2 - panelRect.width / 2;

    left = Math.max(8, Math.min(left, window.innerWidth - panelRect.width - 8));

    setStyle({
      position: "absolute",
      top,
      left,
      zIndex: 50,
    });

    // Arrow positioning (relative to panel)
    const arrowCenter =
      triggerRect.left +
      triggerRect.width / 2 -
      left; /* center of trigger within panel */
    setArrowStyle({
      left: arrowCenter - 6, // 6 = half arrow size
    });
  }, [open, placement]);

  // Clone child
  const childProps: any = {
    ref: triggerRef,
    "aria-describedby": open ? id : undefined,
  };

  if (hoverEnabled) {
    childProps.onMouseEnter = () => setOpen(true);
    childProps.onMouseLeave = () => setOpen(false);
  }
  if (clickEnabled) {
    childProps.onClick = () => setOpen((v: boolean) => !v);
  }

  return (
    <>
      {React.cloneElement(children, childProps)}
      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            role="tooltip"
            id={id}
            style={style}
            className="relative max-w-lg rounded-2xl bg-white px-6 py-6 text-[20px] leading-relaxed text-[#5B6672] shadow-lg ring-1 ring-gray-200"
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {/* Content */}
            <div className="pr-8">{content}</div>

            {/* Arrow */}
            <span
              aria-hidden
              style={arrowStyle}
              className={`absolute h-3 w-3 rotate-45 bg-white ring-1 ring-gray-200 ${
                placement === "top" ? "bottom-[-6px]" : "top-[-6px]"
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
}
