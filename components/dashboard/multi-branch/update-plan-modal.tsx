"use client";

import Text from "@/components/ui/text";
import { Subscription } from "@/utils/types";
import { SpecialBox } from "../home/job-toast-modal";
import Dropdown from "@/components/ui/dropdown";
import Button from "@/components/ui/custom-btn";
import { useRouter } from "next/navigation";
import { usePricing } from "@/hook/usePricing";
import { ClipLoader } from "react-spinners";

const UpdatePlanModal = ({
  plan,
  close,
  plans,
  onUpdatePlanList,
  handleCancelPlan,
  isCheckingout,
  onReactivate,
}: {
  plan: Subscription;
  close: () => void;
  plans: Subscription[];
  onUpdatePlanList: (item: Subscription) => void;
  handleCancelPlan: any;
  isCheckingout: boolean;
  onReactivate: any;
}) => {
  const router = useRouter();

  const handleNavigateToUpgrade = () => {
    const encodedPlanId = encodeURIComponent(plan.id); // Encode the plan ID to avoid special characters breaking the URL
    router.push(`/upgrade_subscription?planId=${encodedPlanId}`);
  };

  console.log(plan);

  return (
    <div className=" flex-cols gap-4">
      <div className="flex-cols mb-2">
        <Text.Heading className="font-semibold mr-2 text-lg lg:text-xl text-dark-00">
          {plan?.status === "ACTIVE" ? "Edit" : "Activate"} Plan
        </Text.Heading>
        <Text.Paragraph className="text-start text-sm text-dark-500">
          {plan?.status === "ACTIVE" ? "Update" : "Activate"} the branch
          information and settings.
        </Text.Paragraph>
      </div>
      <div className="flex-cols mb-2 w-full">
        <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
          Address
        </Text.Paragraph>
        <SpecialBox
          className="px-4 py-2 w-full flex items-center"
          minHeight="min-h-12"
        >
          <Text.Paragraph className=" mr-2 text-sm  text-dark-500">
            {plan?.coverageAddress?.address}
          </Text.Paragraph>
        </SpecialBox>
      </div>

      <div className="grid-2">
        <div className="flex-cols mb-2 w-full">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            City
          </Text.Paragraph>
          <SpecialBox
            className="px-4 py-2 w-full flex items-center"
            minHeight="min-h-12"
          >
            <Text.Paragraph className=" mr-2 text-sm  text-dark-500">
              {plan?.coverageAddress?.city}
            </Text.Paragraph>
          </SpecialBox>
        </div>

        <div className="flex-cols mb-2 w-full">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            country
          </Text.Paragraph>
          <SpecialBox
            className="px-4 py-2 w-full flex items-center"
            minHeight="min-h-12"
          >
            <Text.Paragraph className=" mr-2 text-sm  text-dark-500">
              {plan?.coverageAddress?.country?.split(" ")?.[
                plan?.coverageAddress?.country?.split(" ")?.length - 1
              ] || ""}
            </Text.Paragraph>
          </SpecialBox>
        </div>
      </div>

      <div className="flex-cols mb-2 w-full">
        <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
          Subscription Plan
        </Text.Paragraph>

        <div className="input-container flex items-center">
          <Text.Paragraph className="text-start text-sm text-dark-500">
            {plan?.planType} - {plan.billingFrequency}
          </Text.Paragraph>
        </div>
      </div>
      <div className="flex-cols mb-2 w-full">
        <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
          Age of Equipment
        </Text.Paragraph>
        <SpecialBox
          className="px-4 py-2 w-full flex items-center"
          minHeight="min-h-12"
        >
          <Text.Paragraph className=" mr-2 text-sm  text-dark-500">
            {plan?.equipmentAgeCategory} years
          </Text.Paragraph>
        </SpecialBox>
      </div>
      {plan?.status === "ACTIVE" ? (
        <div className="flex-rows justify-between gap-2 w-full">
          <Button
            className="w-full"
            onClick={handleNavigateToUpgrade}
            disabled={isCheckingout}
          >
            <Button.Text>Upgrade plan</Button.Text>
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={async () => {
              await handleCancelPlan({
                subscriptionId: plan.id,
              });

              close();
            }}
          >
            <Button.Icon>
              {isCheckingout ? <ClipLoader size={20} /> : null}
            </Button.Icon>
            <Button.Text>
              {isCheckingout ? "Canceling plan...." : "Cancel Plan"}
            </Button.Text>
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={async () => {
            await onReactivate({
              subscriptionId: plan?.id,
            });

            close();
          }}
          disabled={isCheckingout}
        >
          {isCheckingout ? (
            <Button.Icon>
              <ClipLoader size={20} color="#fff" />
            </Button.Icon>
          ) : null}
          <Button.Text>
            {isCheckingout ? "Creating session..." : "Activate plan"}
          </Button.Text>
        </Button>
      )}
    </div>
  );
};

export default UpdatePlanModal;
