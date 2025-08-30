import VerifyOtpPage from "@/components/auth/verify-otp";

// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OTP verification", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Verify your account",
};

const OtpPage = () => {
  return <VerifyOtpPage />;
};

export default OtpPage;
