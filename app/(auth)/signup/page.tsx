// import SignupPage from "@/components/auth/signup-item";

// app/dashboard/page.tsx
import UserInformation from "@/components/auth/info";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account type", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Select your account type",
};

const Signup = () => {
  return <UserInformation />;
};

export default Signup;
