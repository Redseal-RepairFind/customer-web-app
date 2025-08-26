"use client";

// NO "use client" here
import type { ReactNode } from "react";
import DashboardNav from "./dashboard-nav";
import DashNav from "./dash-nav";

export default function ClientDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh + lg:grid-cols-[240px_1fr] relative">
      <DashNav />
      <main className="min-w-full">
        <DashboardNav />
        <div className=" overflow-y-auto p-4">{children}</div>
      </main>
    </div>
  );
}
