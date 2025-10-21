import Text from "@/components/ui/text";
import { BsClock } from "react-icons/bs";
import { ProgressBar } from "./progress-bar";
import { PLANSTYPE } from "./plan-log";
import { useSubCalc } from "@/hook/useSubCalc";
import Image from "next/image";
import { icons, images } from "@/lib/constants";
import { Subscription } from "@/utils/types";
import { getProgress, STATUS_META } from "@/lib/helpers";

const RequestSubmitToast = ({
  subscription,
}: {
  subscription: Subscription;
}) => {
  const { startDate, endDate, percentComplete, daysLeft } =
    useSubCalc(subscription);
  return (
    <div className="w-full md:w-[600px] lg:w-[800px] flex items-center gap-2">
      <span className="h-10 min-w-10 rounded-full flex-row-center bg-red-600">
        <BsClock color="#ffffff" size={24} />
      </span>

      <div className="flex-cols gap-2">
        <Text.Paragraph className="text-white text-sm md:text-base font-bold">
          New Membership come with a 30-day waiting period before you can make
          your first request.
        </Text.Paragraph>

        <Text.Paragraph className="text-white text-xs md:text-sm">
          Service requests will be available in {daysLeft} days. This waiting
          period ensures account security and optimal service quality.
        </Text.Paragraph>

        <ProgressBar
          startDate={startDate.toDate()}
          endDate={endDate.toDate()}
          trackColor="#E1012B" // slate-800
          fillColor="#ffffff" // emerald-500
          showLabel
          label={`${Math.round(percentComplete)}% completed`}
          labelColor="#ffffff" // gray-500
        />
      </div>
    </div>
  );
};

const RequestCompletedToast = ({ status }: { status: string }) => {
  const mStatus = status.toLowerCase();

  const meta = STATUS_META[status];
  if (!meta) return null;
  const header = meta.header;

  const message = meta.report;

  const icontoRender =
    mStatus === "completed" ? icons.completeIcon : icons.noticeIcon;
  return (
    <div className="flex-cols gap-2 w-full">
      <div className="flex-rows items-center gap-2">
        <Image src={icontoRender} height={24} width={24} alt="Check icon" />

        <Text.SmallHeading className="text-dark font-semibold">
          {header}
        </Text.SmallHeading>
      </div>

      <Text.Paragraph className="text-dark-500 text-xs">
        {message}
      </Text.Paragraph>
    </div>
  );
};

export { RequestCompletedToast };

export default RequestSubmitToast;
