"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type CouponResult = {
  success: boolean;
  message?: string;
  data?: { discount?: { finalAmount?: number } };
};

type Status = "idle" | "validating" | "valid" | "invalid" | "error";

export function useCouponValidation(
  couponCode: string,
  planId?: string,
  validateFn?: (p: {
    planId?: string;
    couponCode: string;
  }) => Promise<CouponResult>,
  opts?: { debounceMs?: number; minLen?: number }
) {
  const debounceMs = opts?.debounceMs ?? 500;
  const minLen = opts?.minLen ?? 3;

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CouponResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => `${(couponCode || "").trim().toUpperCase()}|${planId ?? ""}`,
    [couponCode, planId]
  );

  const cache = useRef(new Map<string, CouponResult>());

  useEffect(() => {
    const code = (couponCode || "").trim().toUpperCase();

    if (!code || code.length < minLen || !planId) {
      setStatus("idle");
      setResult(null);
      setError(null);
      return;
    }

    const cached = cache.current.get(key);
    if (cached) {
      setResult(cached);
      setStatus(cached.success ? "valid" : "invalid");
      setError(cached.success ? null : cached.message || "Invalid coupon");
      return;
    }

    setStatus("validating");
    setError(null);

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await validateFn?.({ planId, couponCode: code });
        if (!res) throw new Error("No validator provided");
        cache.current.set(key, res);
        setResult(res);
        setStatus(res.success ? "valid" : "invalid");
        setError(res.success ? null : res.message || "Invalid coupon");
      } catch (e: any) {
        if (ctrl.signal.aborted) return;
        setStatus("error");
        setError(e?.message || "Unable to validate coupon");
        setResult(null);
      }
    }, debounceMs);

    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [key, couponCode, planId, minLen, debounceMs, validateFn]);

  return { status, result, error };
}
