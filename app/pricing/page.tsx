import Pricingg from "@/components/dashboard/pricing";

// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment plans",
  description: "Select your Payment plans",
};

const PricingPage = async () => {
  return <Pricingg isUpgrade={false} />;
};

export default PricingPage;
