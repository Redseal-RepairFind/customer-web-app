"use client";

import { useRef } from "react";
import gsap from "gsap";
import { BsBell } from "react-icons/bs";
import Badge from "../ui/badge";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { FaAlignCenter, FaAlignJustify, FaHamburger } from "react-icons/fa";

type DashboardNavProps = {
  onBellClick?: () => void;
  notificationsCount?: number;
  onOpen: () => void;
};

const DashboardNav = ({
  onBellClick,
  notificationsCount = 0,
  onOpen,
}: DashboardNavProps) => {
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  // micro interaction (optional, safe without ScrollTrigger)
  const bounce = () => {
    if (!bellRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(bellRef.current, { scale: 0.92, duration: 0.08 }).to(
        bellRef.current,
        { scale: 1, duration: 0.18 }
      );
    }, bellRef);
    // clean up timeline
    setTimeout(() => ctx.revert(), 400);
  };

  return (
    <nav
      className="
        sticky top-0 z-30 h-16
        border-b border-b-light-10
        bg-light-main/90 backdrop-blur
        px-4
      "
      aria-label="Dashboard"
      style={{ willChange: "backdrop-filter, background-color" }}
    >
      <div className="h-full mx-auto max-w-screen-2xl flex items-center justify-between lg:justify-end">
        {/* Notifications */}
        <button
          ref={burgerRef}
          className="relative h-5 w-5 cursor-pointer lg:hidden z-50 ml-2 "
          onClick={onOpen}
          aria-label="Open menu"
        >
          <FaAlignJustify />
        </button>

        <button
          ref={bellRef}
          onClick={(e) => {
            bounce();
            onBellClick?.();
          }}
          className="
            relative h-10 w-10 rounded-full
            flex items-center justify-center
            bg-light-300/70 hover:bg-light-300 active:bg-light-400
            transition-[background,transform,box-shadow] duration-200
            outline-none
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-light-500 focus-visible:ring-offset-light-main
          "
          aria-label={
            notificationsCount > 0
              ? `${notificationsCount} new notifications`
              : "Notifications"
          }
        >
          {/* Badge */}
          {notificationsCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1
                translate-x-1 -translate-y-1
                pointer-events-none
              "
            >
              <Badge count={notificationsCount} isActive />
            </span>
          )}

          {/* Icon */}
          <BsBell
            className="h-5 w-5 text-dark-main/80"
            aria-hidden="true"
            focusable="false"
          />
        </button>
      </div>
    </nav>
  );
};

export default DashboardNav;
