"use client";

import Image from "next/image";
import Text from "../ui/text";
import { slideImages } from "@/lib/dasboard-constatns";
import { useEffect, useRef, useState } from "react";
import Button from "../ui/custom-btn";
import { icons, images } from "@/lib/constants";

const ROTATE_MS = 4000; // auto-advance every 4s

const DashboardHeader = ({ user }: { user: any }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slideImages?.length ?? 0;

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const start = () => {
    stop();
    if (total > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % total);
      }, ROTATE_MS);
    }
  };

  useEffect(() => {
    start();
    return stop;
  }, [total]);

  if (!total) {
    return (
      <div className="flex flex-col gap-5 w-full">
        <Text.Paragraph className="font-semibold text-sm md:text-base capitalize">
          Welcome back, {user?.firstName?.toLowerCase()}
        </Text.Paragraph>
        <div className="relative w-full h-[120px] rounded-lg bg-light-300 animate-pulse" />
      </div>
    );
  }

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="flex flex-col gap-5 w-full">
      <Text.SubHeading className="font-semibold capitalize">
        Welcome back, {user?.firstName?.toLowerCase()}
      </Text.SubHeading>

      <section
        className="relative w-full rounded-lg overflow-hidden shadow-sm"
        aria-roledescription="carousel"
        aria-label="Dashboard highlights"
        onMouseEnter={stop}
        onMouseLeave={start}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") goPrev();
          if (e.key === "ArrowRight") goNext();
        }}
      >
        <div className="relative w-full  min-h-[120px]">
          {slideImages.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`Slide ${i + 1} of ${total}`}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 object-cover transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              sizes="100vw"
            />
          ))}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        </div>

        <div className="absolute inset-0 ">
          <div className="flex-row-between gap-2 h-full md:px-4 px-2 py-2">
            <div className="py-2">
              <Text.Paragraph className="text-light-main font-semibold text-sm md:text-base leading-tight">
                Get your repair requests handled by trusted contractors
              </Text.Paragraph>

              <Text.SmallText className="text-dark-100 text-xs md:text-sm leading-tight">
                Submit detailed repair requests and track progress from start to
                finish
              </Text.SmallText>
            </div>

            <Button variant="tertiary">
              <Button.Icon className="h-4 w-4 relative">
                <Image src={icons.requestIconActive} fill alt="button icon" />
              </Button.Icon>
              <Button.Text className="text-xs md:text-sm">
                Submit a request
              </Button.Text>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
          {slideImages.map((_, i) => (
            <button
              key={`dot-${i}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-white ${
                i === index
                  ? "bg-white scale-110"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardHeader;
