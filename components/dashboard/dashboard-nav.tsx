"use client";

import { useRef } from "react";
import gsap from "gsap";
import { BsBell } from "react-icons/bs";
import Badge from "../ui/badge";
import { FaAlignJustify } from "react-icons/fa6";
import { FcDisclaimer } from "react-icons/fc";
import Text from "../ui/text";
import { useUser } from "@/hook/useMe";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { usePageNavigator } from "@/hook/navigator";

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
  const { navigator } = usePageNavigator();
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const { curUser, loadingCurUser } = useUser();

  const userData = curUser?.data;
  const unknown =
    userData?.subscriptions[0]?.equipmentAgeCategory === "unknown";
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

  const gotoNotif = () => navigator.navigate("/notifications", "push");

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
      <div
        className={`h-full mx-auto max-w-screen-2xl flex items-center justify-between ${
          unknown ? "lg:justify-between" : "lg:justify-end"
        }`}
      >
        {/* Notifications */}

        {unknown ? (
          <div className="hidden lg:flex lg:items-center gap-3 mt-4">
            <Image src={icons.disclaimer} height={24} width={24} alt="Image" />
            <Text.Paragraph className="font-bold">
              {" "}
              Your account is currently pending, a staff will be coming over to
              confirm age of equipment
            </Text.Paragraph>
          </div>
        ) : null}
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
            gotoNotif();
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
                absolute top-1 right-1
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
