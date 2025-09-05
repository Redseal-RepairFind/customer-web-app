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
import { useToast } from "@/contexts/toast-contexts";
import RequestSubmitToast from "./request-submit-toast";

const DashboardHome = () => {
  const [isRec, setIsRec] = useState(true);

  const { curUser, loadingCurUser } = useUser();
  const { trxSummary, isLoadingTrxSummary } = useDashboard();
  // console.log(curUser);
  // const { success, error, warning, info, toast, clearAll } = useToast();

  if (loadingCurUser || isLoadingTrxSummary) return <LoadingTemplate />;

  const userData = curUser?.data;
  const trxData = trxSummary?.data;
  const unknown = userData?.subscription?.equipmentAgeCategory === "unknown";
  // console.log(userData?.subscription?.equipmentAgeCategory);
  // console.log(trxSummary);

  const metrics = {
    ...userData?.stats,
    ...trxData,
    planType: userData?.subscription,
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
