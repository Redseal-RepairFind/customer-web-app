import ResetPassword from "@/components/auth/rest-password";

// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Password reset",
};

const ResetPasswordPage = () => {
  return <ResetPassword />;
};

export default ResetPasswordPage;
