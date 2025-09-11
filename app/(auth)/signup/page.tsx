import SignupPage from "@/components/auth/signup-item";

// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account type", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Select your account type",
};

const Signup = () => {
  return <SignupPage />;
};

export default Signup;
