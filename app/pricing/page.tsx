"use client";

import Pricingg from "@/components/dashboard/pricing";

// app/dashboard/page.tsx
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   description: "Select your Payment plans",
// };

const PricingPage = () => {
  return <Pricingg isUpgrade={false} />;
};

export default PricingPage;
