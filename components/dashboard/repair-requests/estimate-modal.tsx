import Button from "@/components/ui/custom-btn";
import Text from "@/components/ui/text";
import { useRepairs } from "@/hook/useRepairs";
import { icons } from "@/lib/constants";
import { formatCurrency, getTimeAgo } from "@/lib/helpers";
import { RepairJob } from "@/utils/types";
import Image from "next/image";
import React, { ReactNode } from "react";
import { CgClose } from "react-icons/cg";
import { ClipLoader } from "react-spinners";

const estimateHeader = ["Description", "Qty", "Rate", "Amt"];
const Estimate = ({
  estimate,
  closeModal,
  openPayment,
}: {
  estimate: RepairJob;
  closeModal: () => void;
  openPayment: () => void;
}) => {
  const { charges, estimates } = estimate?.contract;

  const { breakdown, breakdown_meta } = charges.customerSummary;

  const { handleAcceptEstimate, handleDeclineEstimate, creatingRequest } =
    useRepairs();

  console.log(estimate);
  // const
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

        {estimates?.map((est) => (
          <React.Fragment key={est._id}>
            <EstimateItemText>{est.description}</EstimateItemText>
            <EstimateItemText>{est.quantity}</EstimateItemText>
            <EstimateItemText>{formatCurrency(est.rate)}</EstimateItemText>
            <EstimateItemText isEnd>
              {formatCurrency(est.rate * Number(est.quantity))}
            </EstimateItemText>
          </React.Fragment>
        ))}
      </div>

      <div className="border-b border-light-0 py-2 grid grid-cols-2 gap-y-3">
        <div>
          <EstimateItemText>Sub total</EstimateItemText>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(charges.subtotal)}
          </Text.SubHeading>
        </div>

        {breakdown_meta.map((mta) => (
          <React.Fragment key={mta.label}>
            <div>
              <EstimateItemText>{mta.label}</EstimateItemText>
            </div>
            <div className="flex justify-end">
              <Text.SubHeading className="text-sm font-semibold">
                {formatCurrency(mta.value)}
              </Text.SubHeading>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className=" border-light-0 py-2 grid grid-cols-2 gap-y-3">
        <div className="">
          <Text.SubHeading className="text-sm font-semibold">
            Total
          </Text.SubHeading>
        </div>
        <div className="flex justify-end">
          <Text.SubHeading className="text-sm font-semibold">
            {formatCurrency(charges.customerPayable)}
          </Text.SubHeading>
        </div>
      </div>

      <Button
        onClick={() => {
          //   handleAcceptEstimate({
          //     jobId: estimate._id,
          //     quotesId: estimate.contract._id,
          //     close: () => {
          //       closeModal();
          //       openPayment();
          //     },
          //   });

          closeModal();
          openPayment();
        }}
      >
        <Button.Icon>
          {creatingRequest ? (
            <ClipLoader size={20} color="#fff" />
          ) : (
            <Image src={icons.card} alt="" height={20} width={20} />
          )}
        </Button.Icon>
        <Button.Text>
          {creatingRequest ? "Accepting..." : "Proceed"}
        </Button.Text>
      </Button>
      {/* <Button variant="secondary">
        <Button.Icon>
          <CgClose color="#000" size={20} />
        </Button.Icon>
        <Button.Text>Decline</Button.Text>
      </Button> */}
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
