import Text from "@/components/ui/text";
import Box from "./box";
import { ProgressBar } from "./progress-bar";
import { quickActions } from "@/lib/dasboard-constatns";
import Link from "next/link";
import Image from "next/image";

const PlanLog = () => {
  return (
    <div className="md:grid-cols-2 grid lg:gap-2 xl:gap-4 gap-4">
      <Box className="h-[142px] ">
        <div className="flex justify-between  h-full">
          <div className="flex flex-col gap-8 h-full">
            <Text.Paragraph>Plan Status</Text.Paragraph>
            <div>
              <Text.SmallText>Days remaining</Text.SmallText>
              <Text.Paragraph className="font-semibold text-base">
                23 days
              </Text.Paragraph>
            </div>
          </div>
          <div className="flex flex-col gap-9 h-full">
            <PlanBadge planName="Premium" />
            <ProgressBar startDate="2025-08-01" endDate="2025-08-31" />
          </div>
        </div>
      </Box>

      <Box className="h-[142px]  flex-cols gap-8">
        <Text.Paragraph>Quick Actions</Text.Paragraph>

        <div className="w-full flex items-center lg:gap-2 xl:gap-4 gap-2">
          {quickActions.map((action, i) => (
            <Link href={action.route} key={action.route}>
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
                  } text-xs xl:text-sm md:hidden xl:flex`}
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
    <div className="px-8 flex items-center justify-center  min-h-[38px] border border-light-10 rounded-full">
      <Text.SmallText>{planName}</Text.SmallText>
    </div>
  );
};

// export const ProgressBar = () => {};
