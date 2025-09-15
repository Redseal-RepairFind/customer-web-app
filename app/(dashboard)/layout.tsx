import ClientDashboardLayout from "@/components/dashboard/dashboard-layout";
import { isToken } from "@/utils/isAuth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const token = await isToken();

  if (!token?.value) redirect("/home");
  // console.log(token);
  // console.log("🔑 cookie in layout:", token?.value);

  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
};

export default DashboardLayout;
