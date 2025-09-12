"use client";

import { useContext, useState, type ReactNode } from "react";
import DashboardNav from "./dashboard-nav";
import DashNav from "./dash-nav";
import { NavWindow } from "../landing";
import { dashboardNav, otherNav } from "@/lib/dasboard-constatns";
import { useNotification } from "@/hook/useNotification";
import { useSocket } from "@/contexts/socket-contexts";

export default function ClientDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const { badgeCount, badge } = useSocket();

  // console.log(badgeCount);

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

        <DashboardNav
          onOpen={() => setNavOpen(true)}
          notificationsCount={badgeCount?.totalCount || badge}
        />

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
