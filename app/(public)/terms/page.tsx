// app/dashboard/page.tsx
import SubscriptionAgreementPage from "@/components/public/sub-terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Condition", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Terms & Condition Agreement",
};

const Terms = () => {
  return <SubscriptionAgreementPage />;
};

export default Terms;
