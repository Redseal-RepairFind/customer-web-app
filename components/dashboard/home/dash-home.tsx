"use client";

import EmptyPage from "@/components/ui/empty";
import DashboardHeader from "../header";
import Metrics from "./metrics";
import PlanLog from "./plan-log";
import RecentRequests from "./recent-requests";
import { useState } from "react";

const DashboardHome = () => {
  const [isRec, setIsRec] = useState(true);
  return (
    <main className="w-full">
      <DashboardHeader />

      <section className="flex-cols gap-5 mt-8">
        <PlanLog />
        <Metrics />

        {isRec ? (
          <RecentRequests />
        ) : (
          <EmptyPage
            tytle="No Recent Request"
            message="Your recent activity appears here."
          />
        )}
      </section>
    </main>
  );
};

export default DashboardHome;
