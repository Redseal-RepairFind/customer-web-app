import { useCallback, useEffect, useRef, useState } from "react";

type UseCopyOpts = { resetAfterMs?: number };

/**
 * useCopyToClipboard
 * returns { isCopied, copy }.
 * copy(text) => Promise<boolean>
 */
export function useCopyToClipboard({ resetAfterMs = 2000 }: UseCopyOpts = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const fallbackCopy = useCallback(async (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }, []);

  const copy = useCallback(
    async (text: string) => {
      if (typeof window === "undefined") return false;
      if (!text && text !== "") return false;

      let ok = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          ok = await fallbackCopy(text);
        }
      } else {
        ok = await fallbackCopy(text);
      }

      if (ok) {
        setIsCopied(true);
        if (resetAfterMs > 0) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setIsCopied(false);
            timerRef.current = null;
          }, resetAfterMs);
        }
      }

      return ok;
    },
    [fallbackCopy, resetAfterMs]
  );

  return { isCopied, copy };
}
