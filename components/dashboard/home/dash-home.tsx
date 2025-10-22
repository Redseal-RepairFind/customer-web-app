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
import { icons, images } from "@/lib/constants";
import { useRepairs } from "@/hook/useRepairs";
import MultiBranch from "./multi-branch";
import { usePricing } from "@/hook/usePricing";
// import { useNotification } from "@/hook/useNotification";
// import MarqueeBanner from "./margueer-banner";
import { useRouter } from "next/navigation";

const DashboardHome = () => {
  const { curUser, loadingCurUser } = useUser();
  const { trxSummary, isLoadingTrxSummary } = useDashboard();
  const { repairsData, loadingRepairs } = useRepairs();

  const { subscriptions } = usePricing();
  // const { isLoadingBagde, notificationBagde } = useNotification();
  const router = useRouter();
  // console.log(notificationBagde);

  // const { isConnected, socket } = useSocket();

  console.log(curUser);

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

  // console.log(curUser);

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
        {/* <MarqueeBanner
          items={[
            // "🔑 Verified landlords",
            // "🏠 New listings every hour",
            // "💬 In-app secure chat",
            `📅 Hi ${curUser?.data?.firstName}!  Your subscription has been active for 25 days. It's time to schedule your equipment inspection appointment click on this banner to schedule a convenient date and time.`,
          ]}
          // bgSrc={images.CalendarImg}
          bgAlt="" // decorative background
          // bgOpacity={0.35}
          overlay
          overlayClassName="from-black/70 via-transparent to-black/70" // adjust to taste
          speedSec={18}
          direction="left"
          gapPx={48}
          className="h-16 cursor-pointer"
          onClick={() => router.push("/notifications?tab=Actions")}
        /> */}
        <MultiBranch />
        <Metrics stats={metrics} plans={planType} planBalance={totalCredits} />
        <PlanLog plans={planType} />

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
