// app/dashboard/page.tsx
import type { Metadata } from "next";
import SubscriptionAgreementPage from "@/components/public/sub-terms";

export const metadata: Metadata = {
  title: "RepairFind Subscription Agreement",
  description: "Terms for RepairFind subscription-based services.",
};

export default function SubAgreement() {
  return <SubscriptionAgreementPage />;
}
