"use client";

// NO "use client" here
import { useState, type ReactNode } from "react";
import DashboardNav from "./dashboard-nav";
import DashNav from "./dash-nav";
import { NavWindow } from "../landing";
import { dashboardNav, otherNav } from "@/lib/dasboard-constatns";

export default function ClientDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="grid min-h-dvh + lg:grid-cols-[240px_1fr] relative">
      <DashNav />
      <main className="min-w-full">
        <NavWindow
          open={navOpen}
          onClose={() => setNavOpen(false)}
          nav={[...dashboardNav, ...otherNav]}
          isDashboard
        />

        <DashboardNav onOpen={() => setNavOpen(true)} />
        <div className=" overflow-y-auto p-4">{children}</div>
      </main>
    </div>
  );
}
