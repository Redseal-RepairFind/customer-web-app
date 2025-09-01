"use client";

import { useEffect, useState } from "react";
import Text from "../ui/text";
import ToggleBtn from "../ui/toggle-btn";
import PlacesAutocomplete from "../ui/places-autocomplete";
import Dropdown from "../ui/dropdown";
import { equipmentAge, plans } from "@/lib/constants";
import PricingItem from "./pricing-item";
import { useUser } from "@/hook/useMe";
import LoadingTemplate from "../ui/spinner";
import { usePricing } from "@/hook/usePricing";
import Modal from "../ui/customModal";
import PaymentModal from "./home/payment-modal";
import Button from "../ui/custom-btn";
import { usePageNavigator } from "@/hook/navigator";
import { useAuthentication } from "@/hook/useAuthentication";

const Pricingg = () => {
  const { curUser, loadingCurUser } = useUser();
  const { navigator } = usePageNavigator();
  const user = curUser?.data;
  const { handleLogout } = useAuthentication();

  // console.log(user);

  const initAgeCat = equipmentAge.find(
    (eq) => eq.id === user?.subscription?.equipmentAgeCategory
  );
  const [toggle, setToggle] = useState(false);
  const [selectedPredictions, setSelectedPredictions] = useState<any>({
    prediction: user?.subscription?.coverageAddress,
    modal: false,
  });

  const { loadingSubsPlans, monthlyPlans, yearlylyPlans } = usePricing();

  const [dropdown, setDropdown] = useState<any>(initAgeCat);
  const [paymentInfo, setPaymentInfo] = useState({
    info: {},
    open: false,
  });

  useEffect(() => {
    if (user?.subscription) {
      const initAgeCat = equipmentAge.find(
        (eq) => eq.id === user.subscription.equipmentAgeCategory
      );

      setDropdown(initAgeCat || null);
      setSelectedPredictions({
        prediction: user.subscription.coverageAddress || "",
        modal: false,
      });
    }
  }, [user]);
  if (loadingCurUser || loadingSubsPlans) return <LoadingTemplate />;

  // console.log(yearlylyPlans);

  const plansToRender = toggle ? yearlylyPlans : monthlyPlans;

  // console.log(plansToRender);

  const handleCloseInfoModal = () => setPaymentInfo({ info: {}, open: false });
  const handleOpenInfoModal = (item: any) =>
    setPaymentInfo({ info: item, open: true });

  return (
    <main className="w-full my-12 xl:px-16 lg:px-8">
      <Modal isOpen={paymentInfo.open} onClose={handleCloseInfoModal}>
        <PaymentModal
          onClose={handleCloseInfoModal}
          subPlan={paymentInfo?.info}
          dropdown={dropdown}
          selectedPredictions={selectedPredictions}
          setDropdown={setDropdown}
          setSelectedPredictions={setSelectedPredictions}
        />
      </Modal>
      <div className="flex-col-center w-full mb-8 ">
        <button onClick={handleLogout} className="border py-2 px-3 rounded-lg">
          Temp logout
        </button>
        <Text.Heading className="text-xl lg:text-3xl text-center">
          RepairFind Subscription Plans
        </Text.Heading>
        <Text.Heading className="my-2 text-dark-400 text-xl lg:text-3xl text-center">
          We don’t sell repairs, we sells peace of mind
        </Text.Heading>

        <div className="flex items-center justify-center gap-2 text-dark-400 ">
          <Text.Paragraph className="text-dark-400 text-sm lg:text-base text-nowrap">
            Billed monthly
          </Text.Paragraph>

          <ToggleBtn toggle={toggle} onClick={() => setToggle((tg) => !tg)} />

          <Text.Paragraph className="text-green-500 text-sm lg:text-base">
            Bill annually
            {"  "}
            <span className="font-semibold sm:ml-1">
              (Save one month, sign up annually, pay up front)
            </span>
          </Text.Paragraph>
        </div>
      </div>

      <div className="flex-col gap-4 mb-4 ">
        <div className="flex-rows mb-2">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            Home Address{" "}
            <span className="font-light text-xs sm:ml-1">
              (This is the address that will be linked to your subscription)
            </span>
          </Text.Paragraph>

          <Text.SmallText className="text-dark-100 text-xs"></Text.SmallText>
        </div>
        {paymentInfo?.open ? null : (
          <PlacesAutocomplete
            selectedPredictions={selectedPredictions}
            setSelectedPredictions={setSelectedPredictions}
            // modal
          />
        )}
      </div>
      <div className="flex-col gap-4 mb-4">
        <div className="flex-rows mb-2">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            Age of Equipment
            <span className="font-light text-xs sm:ml-1">
              (Providing false information about your equipment’s age will void
              your RepairFind subscription)
            </span>
          </Text.Paragraph>
        </div>
        <Dropdown className="w-full">
          <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
            <Text.Paragraph className="text-dark-500">
              {dropdown?.name || "Select Equipment Age"}
            </Text.Paragraph>
          </Dropdown.Trigger>
          <Dropdown.Content className="w-full bg-white">
            <Dropdown.Label>
              <Text.Paragraph className="text-dark-500">
                {"Select Equipment Age"}
              </Text.Paragraph>
            </Dropdown.Label>

            {equipmentAge.map((eq, i) => (
              <Dropdown.Item
                key={eq.id}
                className={` ${
                  i === equipmentAge?.length - 1
                    ? ""
                    : "border-b border-b-light-100"
                } `}
                onClick={() => setDropdown(eq)}
              >
                <Text.Paragraph className="text-dark-500">
                  {eq.name}
                </Text.Paragraph>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div>

      {dropdown?.id === "unknown" ? (
        <div className="flex-cols gap-2 my-4">
          <Text.Paragraph>
            *If you are not sure of your equipment age range, kindly proceed
            without subscription for now, an agent will visit your address to
            confirm, before you can proceed with your subscription
          </Text.Paragraph>
          <div>
            <Button onClick={() => navigator.navigate("/dashboard", "replace")}>
              <Button.Text>Proceed</Button.Text>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid-3 w-full">
        {plansToRender.map((pla: any, i: number) => {
          let ids: string[] = [];
          if (dropdown)
            if (dropdown?.id === "5-8") {
              ids = [plansToRender[0]?._id];
            } else if (dropdown?.id === "9+") {
              ids = [plansToRender[0]?._id, plansToRender[1]?._id];
            } else if (dropdown?.id === "unknown") {
              ids = plansToRender.map((id: any) => id?._id);
            } else {
              ids = [];
            }
          return (
            <PricingItem
              isRecommended={
                dropdown?.id && dropdown?.id === "1-4"
                  ? i === 0
                  : dropdown?.id === "5-8"
                  ? i === 1
                  : dropdown?.id === "9+"
                  ? i === 2
                  : false
              }
              item={pla as any}
              key={i}
              cycle={toggle ? "yearly" : "monthly"}
              blurItems={ids}
              onSelectPlan={handleOpenInfoModal}
            />
          );
        })}
      </div>
    </main>
  );
};

export default Pricingg;
