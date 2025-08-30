// DO NOT put "use client" here unless you need client-only hooks.
// This file uses useState, so it **does** need "use client".
"use client";

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
    // No grid needed on lg since sidebar is fixed.
    <div className="min-h-dvh">
      <DashNav />

      {/* Reserve space for the fixed 280px sidebar on lg+ */}
      <main className="lg:ml-[240px]">
        <NavWindow
          open={navOpen}
          onClose={() => setNavOpen(false)}
          nav={[...dashboardNav, ...otherNav]}
          isDashboard
        />

        <DashboardNav onOpen={() => setNavOpen(true)} />

        {/* Let the main content scroll; use calc to fill the rest of the viewport */}
        <div
          className="p-4"
          style={{ height: "calc(100dvh - 56px)", overflowY: "auto" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
