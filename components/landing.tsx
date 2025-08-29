"use client";

import gsap from "gsap";
import Image from "next/image";
import Navigation from "./ui/nav";
import Text from "./ui/text";
import { images, nav } from "@/lib/constants";
import Button from "./ui/custom-btn";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import RepairfindLogo from "./ui/logo";
import { CgClose } from "react-icons/cg";
import { useEffect, useRef, useState } from "react";
import { usePageNavigator } from "@/hook/navigator";

gsap.registerPlugin(useGSAP, SplitText);

const Home = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { navigator } = usePageNavigator();
  useGSAP(() => {
    const subtitleSplit = new SplitText(".subtitle", { type: "chars,words" });
    const titleSplit = new SplitText(".title", { type: "lines" });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.from(subtitleSplit.chars, {
      yPercent: 100,
      opacity: 0,
      duration: 0.6,
      stagger: 0.03,
    })
      .from(
        titleSplit.lines,
        {
          yPercent: 100,
          opacity: 0,
          duration: 1,
          stagger: 0.05,
        },
        "-=0.3"
      )
      // image drops in from above and bounces a bit
      .from(
        ".hero-image",
        {
          y: -120,
          opacity: 0,
          duration: 1,
          ease: "bounce.out",
        },
        "-=0.2"
      )
      // button fades in (and slides up slightly)
      .from(
        ".cta-btn",
        {
          autoAlpha: 0,
          y: 16,
          duration: 0.5,
        },
        "-=0.1"
      );
  }, []); // auto-collects & reverts

  return (
    <main className="lg:px-5 bg-black h-dvh relative px-4">
      <Navigation onMenuOpen={() => setNavOpen(true)} />
      <NavWindow open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="flex items-center justify-center h-full w-full lg:px-8 xl:px-16 ">
        <div className="flex flex-col lg:flex-row lg:justify-between w-full">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <Text.Heading className="lg:text-4xl text-white font-bold text-center lg:text-start title">
              Connect with a Trusted Contractor{" "}
              <br className="hidden lg:block" /> in Vancouver - At Your Service!
            </Text.Heading>

            <Text.Paragraph className="text-xl text-white my-5 text-center lg:text-start subtitle">
              Match with skilled professionals and book services today.
            </Text.Paragraph>

            <Button
              className="border border-light-main cta-btn"
              variant="secondary"
              onClick={() => navigator.navigate("/signup", "push")}
            >
              <Button.Text>Become a premium customer</Button.Text>
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start">
            <div className="w-[400px] md:w-[500px] lg:w-[600px] lg:h-[450px] h-96 relative hero-image">
              <Image
                src={images.home}
                fill
                alt="Landing image"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;

type NavWindowProps = { open: boolean; onClose: () => void };

const NavWindow = ({ open, onClose }: NavWindowProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLButtonElement | null>(null);
  const linkRefs = useRef<HTMLButtonElement[]>([]);
  const ctaRefs = useRef<HTMLDivElement[]>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  // keep arrays stable
  linkRefs.current = [];
  ctaRefs.current = [];
  const { navigator } = usePageNavigator();
  const addLinkRef = (el: HTMLButtonElement | null) => {
    if (el && !linkRefs.current.includes(el)) linkRefs.current.push(el);
  };
  const addCtaRef = (el: HTMLDivElement | null) => {
    if (el && !ctaRefs.current.includes(el)) ctaRefs.current.push(el);
  };

  // Build a single timeline and toggle play/reverse based on `open`
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    (ctx) => {
      const mm = gsap.matchMedia();
      const reduced = "(prefers-reduced-motion: reduce)";

      mm.add(reduced, () => {
        // minimal motion variant
        tlRef.current = gsap
          .timeline({ paused: true })
          .set(rootRef.current, { display: "block" })
          .fromTo(
            scrimRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.2, ease: "none" }
          )
          .fromTo(
            panelRef.current,
            { y: -10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: "none" },
            "<"
          )
          .from(
            linkRefs.current,
            { opacity: 0, duration: 0.15, stagger: 0.03 },
            "<"
          )
          .from(
            ctaRefs.current,
            { opacity: 0, duration: 0.15, stagger: 0.05 },
            "<"
          )
          .fromTo(
            closeRef.current,
            { rotate: 0 },
            { rotate: 180, duration: 0.2 },
            "<"
          );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        tlRef.current = gsap
          .timeline({ paused: true, defaults: { ease: "expo.out" } })
          // make it renderable
          .set(rootRef.current, { display: "block" })
          // scrim fade
          .fromTo(
            scrimRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.35, ease: "power2.out" }
          )
          // panel drop + subtle skew/rotate then settle
          .fromTo(
            panelRef.current,
            { y: -80, opacity: 0, rotate: -2, skewY: 3 },
            { y: 0, opacity: 1, rotate: 0, skewY: 0, duration: 0.7 },
            "<-0.1"
          )
          // fun clip reveal on the inner card
          .fromTo(
            panelRef.current,
            { clipPath: "inset(0 0 100% 0 round 16px)" },
            { clipPath: "inset(0 0 0% 0 round 16px)", duration: 0.6 },
            "<"
          )
          // links: alternating x slide + fade with small overshoot
          .from(
            linkRefs.current,
            {
              y: 24,
              opacity: 0,
              duration: 0.5,
              stagger: (i) => 0.05 * i,
              ease: "back.out(1.6)",
            },
            "-=0.2"
          )
          // CTAs: scale pop
          .from(
            ctaRefs.current,
            {
              scale: 0.9,
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.08,
              ease: "back.out(1.8)",
            },
            "-=0.2"
          )
          // close icon spin
          .fromTo(
            closeRef.current,
            { rotate: -90, opacity: 0 },
            { rotate: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
            "<"
          );
      });

      return () => {
        mm.revert();
      };
    },
    { dependencies: [] }
  );

  // play/reverse based on `open`
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (open) {
      tl.play(0);
      // focus first link for accessibility
      setTimeout(() => {
        linkRefs.current[0]?.focus();
      }, 10);
    } else {
      // reverse and hide after
      tl.reverse();
      tl.eventCallback("onReverseComplete", () => {
        gsap.set(rootRef.current, { display: "none" });
      });
    }
  }, [open]);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] hidden"
      aria-hidden={!open}
    >
      {/* BLURRED SCRIM (kept) */}
      <button
        ref={scrimRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close navigation overlay"
        onClick={onClose}
      />

      {/* YOUR PANEL UI — unchanged markup/classes, only refs + onClose hook */}
      <div
        ref={panelRef}
        className="absolute left-0 right-0 top-0 h-[80%] bg-white z-5 p-5 "
      >
        <div className="flex-row-between mb-8">
          <RepairfindLogo nav />
          <button className=" cursor-pointer" onClick={onClose} ref={closeRef}>
            <CgClose size={28} />
          </button>
        </div>

        <div className="flex items-center justify-center  w-full">
          <div className="w-[90%]  flex flex-col items-center gap-4 bg-white shadow-lg rounded-lg py-4">
            <ul className="w-full flex flex-col items-center gap-4">
              {nav.map((nv) => (
                <li className="" key={nv.name}>
                  <button
                    ref={addLinkRef}
                    className="cursor-pointer w-full"
                    onClick={onClose}
                  >
                    {nv.name}
                  </button>
                </li>
              ))}
            </ul>

            <div
              ref={addCtaRef}
              className="w-full flex flex-col items-center gap-3"
            >
              <Button
                className="border border-light-main text-white cursor-pointer"
                border
              >
                <Button.Text>Sign in</Button.Text>
              </Button>
              <div ref={addCtaRef as any}>
                <Button
                  className="border border-light-main"
                  variant="secondary"
                  onClick={() => navigator.navigate("/signup", "push")}
                >
                  <Button.Text className="hover:text-white">
                    Become a contractor
                  </Button.Text>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
