"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { icons, nav as navLinks } from "@/lib/constants";
import RepairfindLogo from "./logo";
import Button from "./custom-btn";
import { usePageNavigator } from "@/hook/navigator";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Navigation = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { navigator } = usePageNavigator();

  const navRef = useRef<HTMLElement | null>(null);
  const logoWrapRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLUListElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  useGSAP(
    () => {
      const navEl = navRef.current!;
      const logoWrap = logoWrapRef.current!;
      const links = linksRef.current!;
      const ctas = ctasRef.current!;
      const burger = burgerRef.current!;

      // Base state
      gsap.set(navEl, {
        backgroundColor: "transparent",
        backdropFilter: "blur(0px)",
        yPercent: 0,
      });
      gsap.set(logoWrap, { scale: 1 });
      gsap.set([links, ctas], { opacity: 1 });
      gsap.set(navEl, { height: navEl.offsetHeight }); // lock height for smoother tween

      // Intro reveal (on page load)
      gsap.from(navEl, {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // Shrink + blur when scrolled a bit
      const shrinkTL = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });
      shrinkTL
        .to(navEl, {
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          duration: 0.35,
        })
        .to(
          navEl,
          {
            // shrink height ~20% (use inline style for smoothness)
            height: Math.max(56, Math.round(navEl.offsetHeight * 0.8)),
            duration: 0.35,
          },
          "<"
        )
        .to(
          logoWrap,
          {
            scale: 0.92,
            duration: 0.35,
          },
          "<"
        );

      // Toggle shrinkTL based on scroll threshold
      ScrollTrigger.create({
        start: 40, // after 40px scrolled
        onEnter: () => shrinkTL.play(),
        onLeaveBack: () => shrinkTL.reverse(),
      });

      // Hide on scroll down, show on scroll up
      let lastY = 0;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const currY = self.scroll();
          const goingDown = currY > lastY && currY - lastY > 2;
          lastY = currY;

          // Don’t hide at very top
          if (currY < 10) {
            gsap.to(navEl, { yPercent: 0, duration: 0.35, ease: "power3.out" });
            return;
          }
          gsap.to(navEl, {
            yPercent: goingDown ? -100 : 0,
            duration: 0.35,
            ease: "power3.out",
          });
        },
      });

      // Burger micro interaction
      burger.addEventListener("pointerdown", () => {
        gsap.to(burger, { scale: 0.9, duration: 0.08, ease: "power1.out" });
      });
      burger.addEventListener("pointerup", () => {
        gsap.to(burger, { scale: 1, duration: 0.12, ease: "back.out(2)" });
      });
      burger.addEventListener("pointerleave", () => {
        gsap.to(burger, { scale: 1, duration: 0.12, ease: "back.out(2)" });
      });

      // Reduced motion: disable big moves
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        shrinkTL.duration(0);
        ScrollTrigger.getAll().forEach((st) => st.kill());
        gsap.set(navEl, { yPercent: 0 });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: navRef }
  );

  return (
    <nav
      ref={navRef}
      className="flex lay-bg items-center justify-between top-0 right-0 left-0 h-20 py-2 nav fixed z-[40] px-2"
      style={{
        willChange: "transform, backdrop-filter, background-color, height",
      }}
      aria-label="Primary"
    >
      <div ref={logoWrapRef} className="flex items-center">
        <RepairfindLogo type="link" nav />
      </div>

      <ul
        ref={linksRef}
        className="lg:flex lg:items-center lg:gap-3 gap-2 hidden"
      >
        {navLinks.map((nv) => (
          <li className="text-light-main" key={nv.name}>
            <button
              className="cursor-pointer w-full relative
                         after:content-[''] after:absolute after:left-0 after:-bottom-1
                         after:h-[2px] after:w-0 after:bg-current
                         hover:after:w-full after:transition-[width] after:duration-200"
            >
              {nv.name}
            </button>
          </li>
        ))}
      </ul>

      <button
        ref={burgerRef}
        className="relative h-5 w-5 cursor-pointer lg:hidden active:opacity-90 mr-2"
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Image src={icons.hamburger} fill alt="Menu icon" />
      </button>

      <div ref={ctasRef} className="gap-2 hidden lg:flex">
        <Button
          className="border border-light-main text-white cursor-pointer"
          border
          onClick={() => navigator.navigate("/login", "push")}
        >
          <Button.Text>Sign in</Button.Text>
        </Button>
        <Button className="border border-light-main" variant="secondary">
          <Button.Text
            className="hover:text-white"
            onClick={() => navigator.navigate("/signup", "push")}
          >
            Become a premium customer
          </Button.Text>
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
