"use client";

import React, { useEffect, useState } from "react";

type ProgressBarProps = {
  /** Subscription start date (Date or ISO string) */
  startDate: Date | string;
  /** Subscription end/expiry date (Date or ISO string) */
  endDate: Date | string;
  /** Show text labels (days left + %) */
  showText?: boolean;
  /** Height in px */
  height?: number;
  className?: string;
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
  showText = true,
  height = 5,
  className,
}) => {
  const start = toDate(startDate);
  const end = toDate(endDate);

  const [{ pct, daysLeft }, setState] = useState(() =>
    calcProgress(start, end)
  );

  useEffect(() => {
    // Update roughly every minute so it rolls over near midnight
    const id = setInterval(() => setState(calcProgress(start, end)), 60_000);
    // Also update immediately on mount/prop change
    setState(calcProgress(start, end));
    return () => clearInterval(id);
  }, [startDate, endDate]); // re-run if dates change

  // Auto color: goes amber <30% time left, red <10% time left
  const barColor =
    daysLeft <= 3
      ? "bg-red-500"
      : daysLeft <= 7
      ? "bg-orange-500"
      : "bg-emerald-500";

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {/* {showText && (
        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
          <span>Subscription</span>
          <span>
            {daysLeft > 0
              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
              : "Expired"}
          </span>
        </div>
      )} */}

      <div
        className="w-full overflow-hidden rounded-full bg-light-100"
        style={{ height }}
        role="progressbar"
        aria-label="Subscription progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className={`bg-dark h-full rounded-full transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* {showText && (
        <div className="mt-1 text-right text-[11px] text-gray-600">
          {Math.round(pct)}%
        </div>
      )} */}
    </div>
  );
};
