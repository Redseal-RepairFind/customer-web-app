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
import Text from "@/components/ui/text";
import Image from "next/image";
import { icons } from "@/lib/constants";
import MultiBranch from "./multi-branch";

const DashboardHome = () => {
  const [isRec, setIsRec] = useState(false);

  const { curUser, loadingCurUser } = useUser();
  const { trxSummary, isLoadingTrxSummary } = useDashboard();

  if (loadingCurUser || isLoadingTrxSummary) return <LoadingTemplate />;

  const userData = curUser?.data;
  const trxData = trxSummary?.data;
  const unknown =
    userData?.subscriptions[0]?.equipmentAgeCategory === "unknown";

  const planType = userData?.subscriptions?.find((user: any) =>
    user?.status?.toLowerCase()?.includes("active")
  );

  const metrics = {
    ...userData?.stats,
    ...trxData,
    planType,
  };

  return (
    <main className="w-full">
      <DashboardHeader />
      {unknown ? (
        <div className="flex items-center gap-3 mt-4  lg:hidden">
          <Image src={icons.disclaimer} height={24} width={24} alt="Image" />
          <Text.Paragraph className="font-bold">
            Your account is currently pending, a staff will be coming over to
            confirm age of equipment
          </Text.Paragraph>
        </div>
      ) : null}
      <section className="flex-cols gap-5 mt-8">
        <PlanLog plans={planType} />
        <Metrics stats={metrics} plans={planType} />
        <MultiBranch />
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
