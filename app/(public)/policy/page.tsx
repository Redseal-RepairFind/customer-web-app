// app/dashboard/page.tsx
import SubscriptionAgreementPage from "@/components/public/sub-terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy Agreement", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Privacy Policy Agreement",
};

const Policy = () => {
  return <SubscriptionAgreementPage />;
};

export default Policy;
