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
}: {
  plan: Subscription;
  close: () => void;
  plans: Subscription[];
  onUpdatePlanList: (item: Subscription) => void;
  handleCancelPlan: any;
  isCheckingout: boolean;
}) => {
  const router = useRouter();

  const handleNavigateToUpgrade = () => {
    const encodedPlanId = encodeURIComponent(plan.id); // Encode the plan ID to avoid special characters breaking the URL
    router.push(`/upgrade_subscription?planId=${encodedPlanId}`);
  };

  return (
    <div className=" flex-cols gap-4">
      <div className="flex-cols mb-2">
        <Text.Heading className="font-semibold mr-2 text-lg lg:text-xl text-dark-00">
          Edit Plan
        </Text.Heading>
        <Text.Paragraph className="text-start text-sm text-dark-500">
          Update the branch information and settings.
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
              {plan?.coverageAddress?.country}
            </Text.Paragraph>
          </SpecialBox>
        </div>
      </div>

      <div className="flex-cols mb-2 w-full">
        <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
          Subscription Plan
        </Text.Paragraph>

        <Dropdown>
          <Dropdown.Trigger className="flex items-center justify-between ">
            <Text.Paragraph className="text-start text-sm text-dark-500">
              {plan?.planType} - {plan.billingFrequency}
            </Text.Paragraph>
          </Dropdown.Trigger>

          <Dropdown.Content>
            {plans?.map((pl) => (
              <Dropdown.Item
                key={pl.planId}
                className="border-b border-b-light-500"
                onClick={() => onUpdatePlanList(pl)}
              >
                <Text.Paragraph className="text-start text-sm text-dark-500">
                  {pl?.planType} - {pl.billingFrequency}
                </Text.Paragraph>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
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
    </div>
  );
};

export default UpdatePlanModal;
