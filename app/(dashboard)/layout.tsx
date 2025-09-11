import ClientDashboardLayout from "@/components/dashboard/dashboard-layout";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
};

export default DashboardLayout;
