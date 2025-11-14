// app/dashboard/page.tsx
import MaintenanceLog from "@/components/dashboard/maintenance";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance logs", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Your Maintenance log info",
};

const MaintenanceHome = () => {
  return <MaintenanceLog />;
};

export default MaintenanceHome;
