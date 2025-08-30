"use client";

import gsap from "gsap";
import Image from "next/image";
import Navigation from "./ui/nav";
import Text from "./ui/text";
import { images, nav } from "@/lib/constants";
import Button from "./ui/custom-btn";
import { useGSAP } from "@gsap/react";
import { SplitText, ScrollTrigger } from "gsap/all"; // ✨ added ScrollTrigger
import RepairfindLogo from "./ui/logo";
import { CgClose } from "react-icons/cg";
import { useEffect, useRef, useState } from "react";
import { usePageNavigator } from "@/hook/navigator";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger); // ✨ register

const Home = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { navigator } = usePageNavigator();

  // Intro hero animations
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
      .from(
        ".cta-btn",
        {
          autoAlpha: 0,
          y: 16,
          duration: 0.5,
        },
        "-=0.1"
      );
  }, []);

  // ✨ Second section fade-in on scroll (per element, no early hide)
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".section-two .reveal").forEach((el) => {
      gsap.from(el, {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        immediateRender: false, // <-- don't hide until the trigger starts
        scrollTrigger: {
          trigger: el, // each element reveals as it enters
          start: "top 85%",
          once: true,
        },
      });
    });

    // ensure proper positions once images/layout settle
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <main className=" relative ">
      <Navigation onMenuOpen={() => setNavOpen(true)} />
      <NavWindow open={navOpen} onClose={() => setNavOpen(false)} nav={nav} />

      <section className="bg-black lg:px-5 px-4 pt-24">
        <div className="flex items-center justify-center   w-full  h-dvh">
          <div className="flex flex-col items-center  lg:justify-between w-full lg:px-8 xl:px-16">
            <div className="flex flex-col items-center justify-center gap-2">
              <Text.Heading className="lg:text-4xl text-white font-bold text-center title">
                One Subscription, Unlimited Peace of{" "}
                <br className="hidden lg:block" />
                Mind for Your Home.
              </Text.Heading>

              <Text.Paragraph className="text-xl text-white my-5 text-center  subtitle">
                Match with skilled professionals and book services today.
              </Text.Paragraph>

              <Button
                className="border border-light-main cta-btn"
                variant="secondary"
                onClick={() => navigator.navigate("/signup", "push")}
              >
                <Button.Text>Subscribe Now</Button.Text>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center lg:items-start lg:justify-start">
              <div className="w-[300px] md:w-[450px] xl:w-[600px] lg:h-[450px] h-96 relative hero-image">
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
        </div>
      </section>

      {/* ✨ tag the whole section & reveal children */}
      <section className="section-two bg-light-main min-h-screen lg:px-8 xl:px-24 mb-12 py-5 px-4">
        <div className="flex flex-col md:flex-row gap-5 md:items-center  md:justify-between ">
          <div className="max-w-[400px] xl:max-w-[610px] flex-cols gap-2">
            <Text.Heading className="reveal">
              Home Repairs, Simplified with Subscription
            </Text.Heading>
            <Text.Paragraph className="reveal">
              Skip the stress of finding contractors every time something
              breaks. With a Repairfind subscription, you get guaranteed access
              to trusted professionals, faster response times, and predictable
              costs — all in one plan. Keep your home running smoothly while we
              take care of the details.
            </Text.Paragraph>
            <div className="reveal">
              <Button onClick={() => navigator.navigate("/login", "replace")}>
                <Button.Text>Subscribe now</Button.Text>
              </Button>
            </div>
          </div>

          <div className="w-[300px]  xl:w-[600px] lg:h-[450px] h-96 relative hero-image ">
            <Image
              src={images.subpic}
              fill
              alt="Landing image"
              className="object-contain"
              // priority
            />
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-5 md:items-center  md:justify-between ">
          <div className="w-[300px]  xl:w-[600px] lg:h-[450px] h-96 relative hero-image ">
            <Image
              src={images.subpic}
              fill
              alt="Landing image"
              className="object-contain"
              // priority
            />
          </div>

          <div className="max-w-[400px] xl:max-w-[610px] flex-cols gap-2">
            <Text.Heading className="reveal">
              One Subscription, Total Home Care{" "}
            </Text.Heading>
            <Text.Paragraph className="reveal">
              Subheading: From AC maintenance to plumbing emergencies,
              Repairfind gives you peace of mind with unlimited repair requests
              through your plan. No hidden fees, no guessing games — just
              reliable service whenever you need it. Designed for busy
              homeowners who value convenience, safety, and trust.
            </Text.Paragraph>
            <div className="reveal">
              <Button onClick={() => navigator.navigate("/login", "replace")}>
                <Button.Text>Subscribe now</Button.Text>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;

type NavWindowProps = { open: boolean; onClose: () => void; nav: any };

export const NavWindow = ({ open, onClose, nav }: NavWindowProps) => {
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
          .set(rootRef.current, { display: "block" })
          .fromTo(
            scrimRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.35, ease: "power2.out" }
          )
          .fromTo(
            panelRef.current,
            { y: -80, opacity: 0, rotate: -2, skewY: 3 },
            { y: 0, opacity: 1, rotate: 0, skewY: 0, duration: 0.7 },
            "<-0.1"
          )
          .fromTo(
            panelRef.current,
            { clipPath: "inset(0 0 100% 0 round 16px)" },
            { clipPath: "inset(0 0 0% 0 round 16px)", duration: 0.6 },
            "<"
          )
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

    // ✨ lock scroll when open
    if (open) {
      document.documentElement.style.overflow = "hidden";
      tl.play(0);
      setTimeout(() => {
        linkRefs.current[0]?.focus();
      }, 10);
    } else {
      document.documentElement.style.overflow = "";
      tl.reverse();
      tl.eventCallback("onReverseComplete", () => {
        gsap.set(rootRef.current, { display: "none" });
      });
    }

    return () => {
      document.documentElement.style.overflow = "";
    };
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
      role="dialog" // ✨ a11y
      aria-modal="true" // ✨ a11y
      aria-hidden={open ? "false" : "true"}
    >
      {/* BLURRED SCRIM */}
      <button
        ref={scrimRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close navigation overlay"
        onClick={onClose}
      />

      {/* PANEL */}
      <div
        ref={panelRef}
        className="absolute left-0 right-0 top-0 h-[80%] bg-white z-5 p-5 rounded-b-2xl shadow-xl"
      >
        <div className="flex-row-between mb-8">
          <RepairfindLogo nav />
          <button
            className=" cursor-pointer"
            aria-label="Close"
            onClick={onClose}
            ref={closeRef}
          >
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
                    onClick={() => {
                      // ✨ navigate if href exists, still closes
                      // if (nv.href) navigator.navigate(nv.href, "push");
                      onClose();
                    }}
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
                // ✨ make it work
                onClick={() => {
                  navigator.navigate("/login", "push");
                  onClose();
                }}
              >
                <Button.Text>Sign in</Button.Text>
              </Button>

              <div ref={addCtaRef as any}>
                <Button
                  className="border border-light-main"
                  variant="secondary"
                  onClick={() => {
                    navigator.navigate("/signup", "push");
                    onClose();
                  }}
                >
                  <Button.Text className="hover:text-white">
                    Subscribe now
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
