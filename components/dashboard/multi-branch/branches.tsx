"use client";

import Text from "@/components/ui/text";
import { SpecialBox } from "../home/job-toast-modal";
import DashboardHeader from "../header";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { BranchCard } from "../home/multi-branch";
import { usePricing } from "@/hook/usePricing";
import LoadingTemplate from "@/components/ui/spinner";
import { Subscriptions } from "@/utils/types";
import { useState } from "react";
import Modal from "@/components/ui/customModal";
import UpdatePlanModal from "./update-plan-modal";
import { useUser } from "@/hook/useMe";
import { ClipLoader } from "react-spinners";
import { useRepairs } from "@/hook/useRepairs";
import Button from "@/components/ui/custom-btn";

const Branches = () => {
  const {
    subscriptions,
    subscriptionsStats,
    // status,
    // error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    // refetch,
    handleCancelPlan,
    isCheckingout,
    handleCheckoutSession,
    sentinelRef,
    isRefetchingSubs,
    handleReactivatePlan,
    handleContinuePlan,
  } = usePricing();

  // console.log(hasNextPage);

  const { curUser4PaymentMethod, loadingCurUser4PaymentMethod } = useUser();
  const [openUpgradeModal, setOpenUpgradeModal] = useState<{
    open: boolean;
    plan: Subscriptions | null;
  }>({
    open: false,
    plan: null,
  });
  const { paymentMethods: PMD, loadingPaymentMethods } = useRepairs();

  const handleOpenModal = (item: Subscriptions) => {
    setOpenUpgradeModal({
      open: true,
      plan: item,
    });
  };
  const handleCloseModal = () => {
    setOpenUpgradeModal({
      open: false,
      plan: null,
    });
  };
  const handleChoosePlan = (item: Subscriptions) => {
    setOpenUpgradeModal((pl) => ({
      ...pl,
      plan: item,
    }));
  };

  const subStats = subscriptionsStats?.[0]?.stats;

  // console.log(curUser4PaymentMethod?.data?.stripePaymentMethods);

  const paymentMethods = PMD?.data;

  if (
    isFetching ||
    loadingCurUser4PaymentMethod ||
    loadingPaymentMethods ||
    isRefetchingSubs
  )
    return <LoadingTemplate />;

  // console.log(subscriptions);
  return (
    <main className="flex-cols gap-5">
      <Modal
        onClose={handleCloseModal}
        isOpen={openUpgradeModal.open}
        maxWidth="max-w-[540px]"
      >
        <UpdatePlanModal
          close={handleCloseModal}
          plan={openUpgradeModal.plan}
          plans={subscriptions}
          onUpdatePlanList={handleChoosePlan}
          handleCancelPlan={handleCancelPlan}
          isCheckingout={isCheckingout}
          onReactivate={handleReactivatePlan}
          onContinue={handleContinuePlan}
        />
      </Modal>
      <DashboardHeader />

      <SpecialBox className="flex justify-around items-center border border-light-10">
        <div className="flex-cols items-center gap-2 ">
          <Text.Paragraph className="text-dark-500 text-base">
            Total Locations
          </Text.Paragraph>
          <Text.Paragraph className="font-bold text-base">
            {subStats?.totalLocations}
          </Text.Paragraph>
        </div>
        <div className="flex-cols items-center gap-2 ">
          <Text.Paragraph className="text-dark-500 text-base">
            Active
          </Text.Paragraph>
          <Text.Paragraph className="font-bold text-base">
            {" "}
            {subStats?.activeLocations}
          </Text.Paragraph>
        </div>
        <div className="flex-cols items-center gap-2 ">
          <Text.Paragraph className="text-dark-500 text-base">
            Inactive
          </Text.Paragraph>
          <Text.Paragraph className="font-bold text-base">
            {" "}
            {subStats?.inactiveLocations}
          </Text.Paragraph>
        </div>
      </SpecialBox>

      <div className="flex-row-between">
        <Text.SmallHeading>Payment Methods</Text.SmallHeading>
        <Button
          variant="secondary"
          disabled={isCheckingout}
          onClick={handleCheckoutSession}
        >
          {isCheckingout ? (
            <Button.Icon>
              <ClipLoader size={24} color="#000000" />
            </Button.Icon>
          ) : null}
          <Button.Text>
            {isCheckingout ? "Creating session..." : "Manage Payment Methods"}
          </Button.Text>
        </Button>
      </div>

      <div className="grid-3 gap-3">
        {paymentMethods?.map((mtd: any) => (
          <PaymentMethodItem method={mtd} key={mtd?.id} />
        ))}
      </div>

      <div className="grid-2">
        {subscriptions?.map((sub) => {
          // if (sub?.status === "PENDING") return null;

          return (
            <BranchCard
              key={sub?.id}
              item={sub}
              size="full"
              onOpenUpgrade={handleOpenModal}
            />
          );
        })}
      </div>
      <div ref={sentinelRef} className="h-12" />

      <div className="flex-row-center w-full">
        {isFetchingNextPage && <ClipLoader size={24} color="#000" />}
      </div>
    </main>
  );
};

export default Branches;

const PaymentMethodItem = ({
  isDefault,
  method,
}: {
  isDefault?: boolean;
  method: any;
}) => {
  console.log(method);
  return (
    <SpecialBox className="flex-cols border border-light-10 p-4">
      {isDefault ? (
        <div className="max-w-[200px]">
          <div className="px-4 py-2 bg-black text-light-main rounded-lg flex-row-center">
            <Text.Paragraph>Default</Text.Paragraph>
          </div>
        </div>
      ) : (
        <div className="max-w-[200px]">
          {/* <Button variant="secondary">
            <Button.Text>Set as default</Button.Text>
          </Button> */}
        </div>
      )}

      <SpecialBox className="flex justify-between items-center border border-light-10 mt-4 p-3">
        <div className="flex-cols gap-2 p-2">
          <div className="flex items-start gap-2">
            <Image src={icons.card} height={20} width={20} alt="Card icon" />
            <div className="flex-col gap-2">
              <Text.Paragraph>
                **** **** **** {method?.card?.last4}
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500">
                Expires {method?.card?.exp_month}/
                {method?.card?.exp_year?.toString()?.split("")[2]}
                {method?.card?.exp_year?.toString()?.split("")[3]}
              </Text.SmallText>
            </div>
          </div>
        </div>

        {/* <button className="px-10 py-2 rounded-4xl border border-light-10 hover:bg-black hover:text-light-main transition-all duration-300 cursor-pointer">
          Edit
        </button> */}
      </SpecialBox>
    </SpecialBox>
  );
};
