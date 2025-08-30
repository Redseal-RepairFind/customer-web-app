import EmailVerification from "@/components/auth/email-verification";
// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Password reset",
};

const ConfirmEmail = () => {
  return <EmailVerification />;
};
export default ConfirmEmail;
