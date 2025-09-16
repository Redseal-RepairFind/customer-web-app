// app/RouteSpy.tsx
"use client";

import { useEffect } from "react";

export default function RouteSpy() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const origPush = history.pushState;
    const origReplace = history.replaceState;

    (history as any).pushState = function (...args: any[]) {
      // eslint-disable-next-line no-console
      console.trace("[RouteSpy] pushState →", args?.[2]);
      return origPush.apply(this, args as any);
    };
    (history as any).replaceState = function (...args: any[]) {
      // eslint-disable-next-line no-console
      console.trace("[RouteSpy] replaceState →", args?.[2]);
      return origReplace.apply(this, args as any);
    };

    return () => {
      (history as any).pushState = origPush;
      (history as any).replaceState = origReplace;
    };
  }, []);

  return <></>;
}
