"use client";

import EmptyPage from "@/components/ui/empty";
import DashboardHeader from "../header";
import Metrics from "./metrics";
import PlanLog from "./plan-log";
import RecentRequests from "./recent-requests";
import { useUser } from "@/hook/useMe";
import LoadingTemplate from "@/components/ui/spinner";
import { useDashboard } from "@/hook/useDashboard";
import Text from "@/components/ui/text";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { useRepairs } from "@/hook/useRepairs";
import MultiBranch from "./multi-branch";
import { useSocket } from "@/contexts/socket-contexts";
import { usePricing } from "@/hook/usePricing";

const DashboardHome = () => {
  const { curUser, loadingCurUser } = useUser();
  const { trxSummary, isLoadingTrxSummary } = useDashboard();
  const { repairsData, loadingRepairs } = useRepairs();

  const { subscriptions } = usePricing();

  // console.log(subscriptions);

  const { isConnected, socket } = useSocket();

  // console.log(socket);

  if (loadingCurUser || isLoadingTrxSummary || loadingRepairs)
    return <LoadingTemplate />;

  const repairs = repairsData?.data?.data;
  const totalCredits = subscriptions
    ?.map((sub) => sub.remainingCredits)
    ?.reduce((arr, cur) => Number(arr || 0) + Number(cur || 0), 0);

  // console.log(totalCredits);

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

  // console.log(repairsData);

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
        <Metrics stats={metrics} plans={planType} planBalance={totalCredits} />
        <MultiBranch />
        {repairs?.length > 0 ? (
          <RecentRequests requestData={repairs} />
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
