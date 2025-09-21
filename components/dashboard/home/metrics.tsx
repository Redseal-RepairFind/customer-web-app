"use client";

import { dummyMetrics } from "@/lib/dasboard-constatns";
import Box from "./box";
import Image from "next/image";
import Text from "@/components/ui/text";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { PLANSTYPE } from "./plan-log";
import dayjs from "dayjs";
import { useToast } from "@/contexts/toast-contexts";

const Metrics = ({
  stats,
  plans,
  planBalance,
}: {
  stats: {
    jobsCompleted: number;
    jobsCanceled: number;
    jobsPending: number;
    jobsTotal: number;
    reviewSummary: { name: string; averageRating: number }[];
    amountInHolding: string;
    amountRefunded: string;
    creditBalance: string;
    planType: string;
  };
  plans: PLANSTYPE;
  planBalance: number;
}) => {
  const { warning } = useToast();

  const allRatings =
    stats &&
    stats?.reviewSummary
      ?.map((rt) => rt.averageRating)
      ?.reduce((cnt, rv) => cnt + rv, 0);

  const avgRating = allRatings / stats.reviewSummary?.length;

  const date = dayjs(plans?.startDate || new Date()?.toDateString());
  const nextDate = date?.add(30, "day");

  console.log(stats);

  console.log(plans);

  const handleFeatureMessage = () => {
    warning({
      vars: { bg: "#fbbd00", fg: "#000" }, // still can theme even with custom render

      render: (api) => (
        <div className="w-full">
          <Text.Paragraph>
            Feature unlocks after waiting period & inspection.
          </Text.Paragraph>
        </div>
      ),
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-2 xl:gap-4  ">
      {dummyMetrics.map((mtrc, i) => (
        <Box
          className="flex gap-4 items-center md:h-[142px]"
          key={i}
          clickable={mtrc?.name === "Next Maintenance Date" ? true : false}
          onClick={() => {
            if (mtrc?.name === "Next Maintenance Date") {
              handleFeatureMessage();
            }
          }}
        >
          <div
            className="
            relative h-10 w-10 lg:h-7 lg:w-7 xl:h-10 xl:w-10 rounded-full
            flex items-center justify-center
            bg-light-300/70 hover:bg-light-300 active:bg-light-400
            transition-[background,transform,box-shadow] duration-200
            outline-none
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-light-500 focus-visible:ring-offset-light-main
          "
          >
            <Image
              src={mtrc.icon}
              className="xl:h-5 xl:w-5 h-5 w-5 md:h-4 md:w-4"
              alt="Icon"
            />
          </div>

          <div className="flex-col gap-2">
            <Text.SmallText className="text-xs lg:text-sm">
              {mtrc.name}
            </Text.SmallText>

            <Text.SmallHeading className="text-sm xl:text-base font-semibold">
              {mtrc.name === "Customer Ratings"
                ? avgRating || 0
                : mtrc.name === "Completed Jobs"
                ? stats.jobsCompleted
                : mtrc.name === "Accrued Credit"
                ? formatCurrency(Number(planBalance || 0))
                : mtrc?.name === "Next Maintenance Date"
                ? `N/A`
                : mtrc.metric}
            </Text.SmallHeading>
          </div>
        </Box>
      ))}
    </div>
  );
};

export default Metrics;
