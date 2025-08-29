"use client";

import { useEffect, useState } from "react";
import OtpInput from "./otp-input";
import AuthQuestion from "./question";
import Button from "../ui/custom-btn";
import Text from "../ui/text";

import { BsFillInfoCircleFill } from "react-icons/bs";
import { useAuthentication } from "@/hook/useAuthentication";
import LoadingTemplate from "../ui/spinner";

const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");

  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  const {
    resending,
    verifying,
    handleEmailVerification,
    handleResendCode,
    otpEror,
  } = useAuthentication();

  useEffect(() => {
    // start cooldown
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="flex-col md:px-5 gap-10 w-full">
      <h1 className="text-2xl font-semibold">Account Verification</h1>
      <Text.Paragraph className=" text-dark-400 text-sm">
        Enter the 6-digit code sent to your email for verification, check
        spam/promotions if you can’t find the email.
      </Text.Paragraph>

      <div className="mt-6">
        <OtpInput
          length={4}
          isError={!!otpEror}
          onChange={setOtp}
          // onComplete={(v) => {
          //   setOtp(v);
          //   // Auto-submit on complete (optional)
          //   verify();
          // }}
        />
      </div>

      {otpEror && (
        <span className="flex-rows gap-2 my-4 ">
          <BsFillInfoCircleFill size={20} className="text-red-600 my-4 " />
          <Text.SmallText className=" text-sm text-red-600 ml-" role="alert">
            {otpEror}
          </Text.SmallText>
        </span>
      )}

      <span className="flex-rows gap-2 my-4">
        <Text.SmallText className="text-dark-500 text-xs">
          Didn’t get the verification code?
        </Text.SmallText>
        {
          <button
            className="cursor-pointer"
            type="button"
            disabled={cooldown > 0}
            onClick={() => {
              setCooldown(RESEND_SECONDS);
              handleResendCode();
            }}
          >
            <Text.SmallText className="text-purple-main text-xs">
              {cooldown > 0 ? cooldown.toString() + "s" : "Resend"}
            </Text.SmallText>
          </button>
        }
      </span>
      <Button
        className="cursor-pointer w-full mt-8 mb-4 min-h-12 relative"
        disabled={verifying || resending}
        onClick={() => handleEmailVerification(otp)}
      >
        {verifying ? (
          <LoadingTemplate isMessage={false} variant="small" />
        ) : (
          <Button.Text>Next</Button.Text>
        )}
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
