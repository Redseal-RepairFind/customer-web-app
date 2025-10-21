"use client";

import React, { useEffect, useState } from "react";

type ProgressBarProps = {
  /** Subscription start date (Date or ISO string) */
  startDate: Date | string;
  /** Subscription end/expiry date (Date or ISO string) */
  endDate: Date | string;

  /** Height in px (default 5) */
  height?: number;
  className?: string;

  /** Colors (CSS color strings). If omitted, defaults are used. */
  trackColor?: string; // background of the track
  fillColor?: string; // filled portion color

  /** Accessible label for screen readers */
  ariaLabel?: string;

  /** Optional label shown BESIDE the bar */
  showLabel?: boolean; // default false
  label?: React.ReactNode; // custom text/content (e.g. "12 days left")
  labelColor?: string; // CSS color for label text
  labelPosition?: "left" | "right"; // default "right"
};

const DAY = 24 * 60 * 60 * 1000;

function toDate(d: Date | string) {
  return d instanceof Date ? d : new Date(d);
}

function calcProgress(start: Date, end: Date, now = new Date()) {
  // Normalize: if now < start, 0%; if now >= end, 100%
  if (now <= start)
    return {
      pct: 0,
      daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY)),
    };
  if (now >= end) return { pct: 100, daysLeft: 0 };

  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / DAY)
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / DAY)
  );
  const elapsedDays = Math.min(totalDays, Math.max(0, totalDays - daysLeft));
  const pct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  return { pct, daysLeft };
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  startDate,
  endDate,
  height = 5,
  className,

  trackColor,
  fillColor,

  ariaLabel = "Membership progress",

  showLabel = false,
  label,
  labelColor,
  labelPosition = "right",
}) => {
  const start = toDate(startDate);
  const end = toDate(endDate);

  const [{ pct, daysLeft }, setState] = useState(() =>
    calcProgress(start, end)
  );

  useEffect(() => {
    const id = setInterval(() => setState(calcProgress(start, end)), 60_000);
    setState(calcProgress(start, end));
    return () => clearInterval(id);
  }, [startDate, endDate]);

  // Default label if you enable it but don't pass one
  const defaultLabel =
    daysLeft > 0
      ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
      : "Expired";

  // Layout: bar + optional label beside it
  const content = (
    <>
      {/* progress track */}
      <div
        className="w-full overflow-hidden rounded-full bg-light-100 flex-1"
        style={{ height, backgroundColor: trackColor }}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        {/* fill */}
        <div
          className="bg-dark h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: fillColor }}
        />
      </div>

      {/* optional label */}
      {showLabel && (
        <span style={{ color: labelColor }} className="text-xs shrink-0">
          {label ?? defaultLabel}
        </span>
      )}
    </>
  );

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="flex items-center gap-2">
        {labelPosition === "left"
          ? React.cloneElement(
              <div />,
              {},
              content.props?.children?.[1],
              content.props?.children?.[0]
            )
          : content}
        {/* ^ If left, render label first then bar; otherwise as-is (bar then label). */}
      </div>
    </div>
  );
};
