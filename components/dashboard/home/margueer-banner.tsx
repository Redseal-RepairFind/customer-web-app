"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";

type Props = {
  items: Array<string | React.ReactNode>;
  speedSec?: number; // seconds per full loop
  direction?: "left" | "right";
  gapPx?: number; // pixel gap between items
  pauseOnHover?: boolean;
  fadeEdges?: boolean;
  className?: string;

  // NEW: background image controls
  bgSrc?: string | StaticImageData; // Next/Image supported
  bgAlt?: string; // decorative? pass "" for decorative
  bgOpacity?: number; // 0..1
  bgBlur?: boolean; // subtle blur
  overlay?: boolean; // dark gradient overlay
  overlayClassName?: string; // customize overlay gradient
  onClick?: () => void;
};

const MarqueeBanner = ({
  items,
  speedSec = 20,
  direction = "left",
  gapPx = 32,
  pauseOnHover = true,
  fadeEdges = true,
  className = "",

  bgSrc,
  bgAlt = "",
  bgOpacity = 0.28,
  bgBlur = true,
  overlay = true,
  overlayClassName = "from-black/60 via-black/30 to-black/60",
  onClick,
}: Props) => {
  // Duplicate items for seamless loop
  const track = (
    <div
      className={[
        "flex items-center w-max",
        direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
        "motion-reduce:animate-none",
      ].join(" ")}
      style={{
        gap: `${gapPx}px`,
        animationDuration: `${speedSec}s`,
      }}
      aria-hidden={false}
    >
      {items.map((it, i) => (
        <div
          key={`a-${i}`}
          className="inline-flex items-center whitespace-nowrap font-semibold text-base"
        >
          {it}
        </div>
      ))}
      {items.map((it, i) => (
        <div
          key={`b-${i}`}
          className="inline-flex items-center whitespace-nowrap font-semibold text-sm"
        >
          {it}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={[
        "relative overflow-hidden w-full rounded-lg text-slate-50 py-2",
        "shadow-sm",
        pauseOnHover ? "group" : "",
        fadeEdges
          ? "[mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
          : "",
        className,
      ].join(" ")}
      role="region"
      aria-label="Scrolling announcements"
      onClick={onClick}
    >
      {/* Background image (optional) */}
      {bgSrc ? (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bgSrc}
            alt={bgAlt}
            fill
            priority={false}
            className={[
              "object-cover select-none pointer-events-none",
              bgBlur ? "blur-[1px]" : "",
            ].join(" ")}
            sizes="100vw"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{ backgroundColor: `rgba(0,0,0,${bgOpacity})` }}
            aria-hidden
          />
          {overlay && (
            <div
              className={`absolute inset-0 -z-10 bg-gradient-to-r ${overlayClassName}`}
              aria-hidden
            />
          )}
        </div>
      ) : (
        // Fallback solid bg when no image
        <div className="absolute inset-0 -z-10 bg-slate-900" aria-hidden />
      )}

      {/* Pause on hover */}
      <div
        className={
          pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
        }
      >
        <div className="px-4">{track}</div>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes marquee-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-right {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-marquee-left,
        .animate-marquee-right {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-marquee-left {
          animation-name: marquee-left;
        }
        .animate-marquee-right {
          animation-name: marquee-right;
        }
      `}</style>
    </div>
  );
};

export default MarqueeBanner;
