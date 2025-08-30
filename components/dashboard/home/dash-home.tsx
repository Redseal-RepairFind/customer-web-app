"use client";

import EmptyPage from "@/components/ui/empty";
import DashboardHeader from "../header";
import Metrics from "./metrics";
import PlanLog from "./plan-log";
import RecentRequests from "./recent-requests";
import { useState } from "react";
import { useUser } from "@/hook/useMe";
import LoadingTemplate from "@/components/ui/spinner";
import { useDashboard } from "@/hook/useDashboard";
import { NavWindow } from "@/components/landing";

const DashboardHome = () => {
  const [isRec, setIsRec] = useState(true);

  const { curUser, loadingCurUser } = useUser();
  const { trxSummary, isLoadingTrxSummary } = useDashboard();
  // console.log(curUser);

  if (loadingCurUser || isLoadingTrxSummary) return <LoadingTemplate />;

  const userData = curUser?.data;
  const trxData = trxSummary?.data;
  console.log(userData?.subscription);
  // console.log(trxSummary);

  const metrics = {
    ...userData?.stats,
    ...trxData,
    planType: userData?.subscription,
  };
  return (
    <main className="w-full">
      <DashboardHeader />
      <section className="flex-cols gap-5 mt-8">
        <PlanLog plans={userData?.subscription} />
        <Metrics stats={metrics} plans={userData?.subscription} />

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
