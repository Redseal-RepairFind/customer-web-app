"use client";

import dynamic from "next/dynamic";

const RepairRequestHome = dynamic(
  () => import("@/components/dashboard/repair-requests/repair-home"),
  { ssr: false }
);

export default function ClientRepair() {
  return <RepairRequestHome />;
}
