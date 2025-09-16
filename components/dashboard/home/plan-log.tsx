"use client";
import Text from "@/components/ui/text";
import Box from "./box";
import { ProgressBar } from "./progress-bar";
import { quickActions } from "@/lib/dasboard-constatns";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";

// currency: "cad";
// equipmentAge: 4;
// nextBillingDate: "2026-08-30T02:35:41.000Z";
// paymentAmount: 5279.89;
// paymentMethodId: "pm_1S1edkD7EKG0EIKuPTonkte2";
// planId: "68b047ca359e42ee4651a5a5";
// planType: "LEGACY";
// providerId: "sub_1S1edlD7EKG0EIKueOoNlTzt";
// startDate: "2025-08-30T02:35:41.000Z";
// status: "PENDING";
// subscriptionType: "RESIDENTIAL";

export type PLANSTYPE = {
  autoRenew: boolean;
  coverageAddress: {
    address: string;
    city: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  equipmentAge: number;
  planId: string;
  planType: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  paymentAmount: number;
};
const PlanLog = ({ plans }: { plans: PLANSTYPE }) => {
  const startDate = dayjs(Date.now());
  const nextBillDate = dayjs(plans?.nextBillingDate);

  // console.log(plans);

  return (
    <div className="">
      {/* <Box className="h-[142px] ">
        <div className="flex justify-between  h-full">
          <div className="flex flex-col gap-8 h-full">
            <Text.Paragraph>Plan Status</Text.Paragraph>
            <div>
              <Text.SmallText>Days remaining</Text.SmallText>
              <Text.Paragraph className="font-semibold text-base">
                {nextBillDate?.diff(startDate, "days") || "0"} days
              </Text.Paragraph>
            </div>
          </div>
          <div className="flex flex-col gap-9 h-full">
            <PlanBadge planName={plans?.planType?.toLowerCase() || "Pending"} />
            <ProgressBar
              startDate={new Date(plans?.startDate)}
              endDate={new Date(plans?.nextBillingDate)}
            />
          </div>
        </div>
      </Box> */}

      <Box className="h-[142px]  flex-cols gap-8">
        <Text.Paragraph>Quick Actions</Text.Paragraph>

        <div className="w-full flex items-center lg:gap-2 xl:gap-4 gap-2">
          {quickActions.map((action, i) => (
            <Link href={action.route} key={action.route} className="w-full">
              <Box
                // className=""
                className={`${
                  i === 0 ? "bg-dark" : " bg-white"
                } flex-rows  rounded-lg gap-2    transition-all duration-300`}
              >
                <span className="sm:h-5 w-4 sm:w-5 h-4 relative">
                  <Image
                    src={i === 0 ? action.icon : action.activeIcon}
                    fill
                    alt="Icons"
                  />
                </span>
                <Text.SmallText
                  className={`${
                    i === 0 ? "text-light-main" : " text-dark-main"
                  } text-xs xl:text-sm  xl:flex`}
                >
                  {action.name}
                </Text.SmallText>
              </Box>
            </Link>
          ))}
        </div>
      </Box>
    </div>
  );
};

export default PlanLog;

export const PlanBadge = ({ planName }: { planName: string }) => {
  return (
    <div className="px-8 flex items-center justify-center  min-h-[38px] border border-light-10 rounded-full capitalize">
      <Text.SmallText>{planName}</Text.SmallText>
    </div>
  );
};

// export const ProgressBar = () => {};
