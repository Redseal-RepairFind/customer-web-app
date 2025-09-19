// app/dashboard/page.tsx
import SubscriptionAgreementPage from "@/components/public/sub-terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RepairFind Subscription Agreement",
  description: "Terms for RepairFind subscription-based services.",
};

const SubAgreement = () => {
  return <SubscriptionAgreementPage />;
};

export default SubAgreement;
