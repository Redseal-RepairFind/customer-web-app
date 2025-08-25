"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpInput from "./otp-input";
import AuthQuestion from "./question";
import Button from "../ui/custom-btn";
import Text from "../ui/text";
import { MdWarning } from "react-icons/md";
import { BiInfoCircle } from "react-icons/bi";
import { BsFillInfoCircleFill } from "react-icons/bs";

const RESEND_SECONDS = 30;

export default function VerifyOtpPage() {
  const router = useRouter();
  const search = useSearchParams();
  const to = search.get("to") ?? ""; // email or phone (masked on UI)
  const flow = search.get("flow") ?? "login"; // optional

  const maskedTo = useMemo(() => {
    if (!to) return "";
    if (to.includes("@")) {
      const [u, d] = to.split("@");
      const mu =
        u.length <= 2
          ? u[0] + "*"
          : u[0] + "*".repeat(Math.max(1, u.length - 2)) + u.at(-1);
      return `${mu}@${d}`;
    }
    // rudimentary phone mask
    return to.replace(/\d(?=\d{2})/g, "*");
  }, [to]);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    // start cooldown
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Optionally trigger initial send
  useEffect(() => {
    // fire-and-forget; ignore errors here
    fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ to }),
    }).catch(() => {});
  }, [to]);

  const verify = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: otp, to, flow }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid or expired code.");
      }
      // success — continue your flow
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [otp, router, to, flow]);

  const resend = useCallback(async () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    setErr(null);
    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ to }),
    }).catch(() => setErr("Failed to resend. Try again."));
  }, [cooldown, to]);

  return (
    <main className="flex-col md:px-5 gap-10 w-full">
      <h1 className="text-2xl font-semibold">Account Verification</h1>
      <Text.Paragraph className=" text-dark-400 text-sm">
        Enter the 6-digit code sent to your email for verification, check
        spam/promotions if you can’t find the email.
      </Text.Paragraph>

      <div className="mt-6">
        <OtpInput
          length={6}
          isError={!!err}
          onChange={setOtp}
          // onComplete={(v) => {
          //   setOtp(v);
          //   // Auto-submit on complete (optional)
          //   verify();
          // }}
        />
      </div>

      {err && (
        <span className="flex-rows gap-2 my-4 ">
          <BsFillInfoCircleFill size={20} className="text-red-600 my-4 " />
          <Text.SmallText className=" text-sm text-red-600 ml-" role="alert">
            {err}
          </Text.SmallText>
        </span>
      )}

      {/* <button
        className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 text-white font-medium disabled:opacity-60"
        onClick={verify}
        disabled={loading || otp.length !== 6}
      >
        {loading ? "Verifying…" : "Verify"}
      </button> */}

      <span className="flex-rows gap-2 my-4">
        <Text.SmallText className="text-dark-500 text-xs">
          Didn’t get the verification code?
        </Text.SmallText>
        {
          <button
            className="cursor-pointer"
            type="button"
            disabled={cooldown > 0}
          >
            <Text.SmallText className="text-purple-main text-xs">
              {cooldown > 0 ? cooldown.toString() + "s" : "Resend"}
            </Text.SmallText>
          </button>
        }
      </span>
      <Button className="cursor-pointer w-full mt-8 mb-4">
        <Button.Text>Next</Button.Text>
      </Button>
      <div className="mt-6 text-sm text-gray-600">
        <AuthQuestion
          link="/login"
          linkTxt={"Log in"}
          text="Have an account?"
        />
      </div>
    </main>
  );
}
