import Button from "@/components/ui/custom-btn";
import Text from "@/components/ui/text";
import { formatCurrency, getTimeAgo } from "@/lib/helpers";
import { RepairJob } from "@/utils/types";
import { ReactNode } from "react";

const estimateHeader = ["Description", "Qty", "Rate", "Amt"];
const Estimate = ({ estimate }: { estimate: RepairJob }) => {
  return (
    <div className="flex-cols gap-2">
      <Text.SmallHeading>{estimate.category}</Text.SmallHeading>
      <Text.SmallText>
        {getTimeAgo(estimate?.createdAt.toString())}
      </Text.SmallText>

      <div className="border-t border-b border-light-0 py-2 grid grid-cols-[1fr_0.5fr_0.7fr_0.8fr] gap-y-3">
        {estimateHeader.map((header, i) => (
          <div key={header}>
            <Text.SmallHeading
              className={`text-sm md:text-base font-semibold ${
                i === estimateHeader.length - 1 ? "text-end" : "text-start"
              }`}
            >
              {header}
            </Text.SmallHeading>
          </div>
        ))}

        <EstimateItemText>Lorem, ipsum.</EstimateItemText>
        <EstimateItemText>2000</EstimateItemText>
        <EstimateItemText>{formatCurrency(200)}</EstimateItemText>
        <EstimateItemText isEnd>{formatCurrency(200)}</EstimateItemText>
      </div>

      <div className="border-b border-light-0 py-2 grid grid-cols-2 gap-y-3">
        <div>
          <EstimateItemText>Sub total</EstimateItemText>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(10)}
          </Text.SubHeading>
        </div>
        <div>
          <EstimateItemText>Card processing fee 3%</EstimateItemText>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(30)}
          </Text.SubHeading>
        </div>
        <div>
          <EstimateItemText>GST 5%</EstimateItemText>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(10)}
          </Text.SubHeading>
        </div>
        <div>
          <EstimateItemText>Service Fee 10%</EstimateItemText>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(16)}
          </Text.SubHeading>
        </div>
      </div>

      <div className=" border-light-0 py-2 grid grid-cols-2 gap-y-3">
        <div className="">
          <Text.SubHeading className="text-sm font-semibold">
            Total
          </Text.SubHeading>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(3000)}
          </Text.SubHeading>
        </div>
      </div>

      <Button>
        {" "}
        <Button.Text>Continue</Button.Text>
      </Button>
    </div>
  );
};

export default Estimate;

const EstimateItemText = ({
  children,
  isEnd,
}: {
  children: ReactNode;
  isEnd?: boolean;
}) => {
  return (
    <Text.Paragraph
      className={`text-xs text-dark-500 ${isEnd ? "text-end" : "text-start"}`}
    >
      {children}
    </Text.Paragraph>
  );
};
