import Pricingg from "@/components/dashboard/pricing";
import { isToken } from "@/utils/isAuth";

// app/dashboard/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Payment plans", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Select your Payment plans",
};

const PricingPage = async () => {
  const token = await isToken();

  if (!token?.value) redirect("/login");
  return <Pricingg isUpgrade />;
};

export default PricingPage;
