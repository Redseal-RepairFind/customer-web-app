import Text from "@/components/ui/text";
import { BsClock } from "react-icons/bs";
import { ProgressBar } from "./progress-bar";
import { PLANSTYPE } from "./plan-log";
import { useSubCalc } from "@/hook/useSubCalc";

const RequestSubmitToast = ({ subscription }: { subscription: PLANSTYPE }) => {
  const { startDate, endDate, percentComplete, daysLeft } =
    useSubCalc(subscription);
  return (
    <div className="w-full md:w-[600px] lg:w-[800px] flex items-center gap-2">
      <span className="h-10 w-10 rounded-full flex-row-center bg-red-600">
        <BsClock color="#ffffff" size={24} />
      </span>

      <div className="flex-cols gap-2">
        <Text.Paragraph className="text-white font-bold">
          New subscriptions come with a 30-day waiting period before you can
          make your first request.
        </Text.Paragraph>

        <Text.Paragraph className="text-white text-sm">
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

export default RequestSubmitToast;
