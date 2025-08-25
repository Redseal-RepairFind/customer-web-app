"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  length?: number;
  disabled?: boolean;
  isError?: boolean;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
};

export default function OtpInput({
  length = 6,
  disabled,
  isError,
  onChange,
  onComplete,
  autoFocus = true,
}: Props) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<HTMLInputElement[]>([]);

  const value = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    onChange?.(value);
    if (value.length === length && values.every((v) => v !== "")) {
      onComplete?.(value);
    }
  }, [value, length, values, onChange, onComplete]);

  useEffect(() => {
    if (autoFocus && refs.current[0]) refs.current[0].focus();
  }, [autoFocus]);

  const setAt = (i: number, v: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(0, 1);
    if (!digit && v.length > 0) return; // ignore non-digits
    setAt(i, digit);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const curr = values[i];
    if (e.key === "Backspace") {
      if (curr) {
        setAt(i, "");
        return;
      }
      if (i > 0) {
        refs.current[i - 1]?.focus();
        setAt(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    } else if (e.key === "Enter" && value.length === length) {
      onComplete?.(value);
    }
  };

  const handlePaste = (
    i: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const chars = pasted.slice(0, length).split("");
    setValues((prev) => {
      const next = [...prev];
      let idx = i;
      for (const c of chars) {
        if (idx >= length) break;
        next[idx++] = c;
      }
      return next;
    });
    const lastIndex = Math.min(i + chars.length - 1, length - 1);
    refs.current[lastIndex]?.focus();
  };

  return (
    <fieldset className="flex gap-2" aria-invalid={isError || undefined}>
      <legend className="sr-only">One-time passcode</legend>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="\d*"
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          className={`h-12 w-10 text-center text-lg rounded-md border outline-none
            ${
              isError
                ? "border-red-500 focus:ring-2 focus:ring-red-400"
                : "border-gray-300 focus:ring-2 focus:ring-dark-00"
            }
            disabled:bg-gray-100`}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          disabled={!!disabled}
          type="text" /* keep text to preserve leading zeros; guide numeric via inputMode/pattern */
          enterKeyHint={i === length - 1 ? "done" : "next"}
          placeholder="-"
        />
      ))}
    </fieldset>
  );
}
