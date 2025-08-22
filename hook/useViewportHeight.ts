"use client";

import { useEffect, useState } from "react";

export function useViewportHeight() {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      setHeight(h);
      // expose to CSS
      document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);
    };
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return { height };
}
