"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Text from "../ui/text";
import ToggleBtn from "../ui/toggle-btn";
import PlacesAutocomplete from "../ui/places-autocomplete";
import Dropdown from "../ui/dropdown";
import { accountType, equipmentAge, icons, plans } from "@/lib/constants";
import PricingItem from "./pricing-item";
import { useUser } from "@/hook/useMe";
import LoadingTemplate from "../ui/spinner";
import { usePricing } from "@/hook/usePricing";
import Modal from "../ui/customModal";
import PaymentModal from "./home/payment-modal";
import Button from "../ui/custom-btn";
import { usePageNavigator } from "@/hook/navigator";
import toast from "react-hot-toast";
import { SUB_EXTRA_ID } from "@/utils/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import { ClipLoader } from "react-spinners";
import { InputContainer } from "../auth/signup-item";
import { useAuthentication } from "@/hook/useAuthentication";
import { CgChevronLeft } from "react-icons/cg";

const Pricingg = ({ isUpgrade }: { isUpgrade: boolean }) => {
  const { curUser, loadingCurUser } = useUser();
  const { navigator } = usePageNavigator();
  const user = curUser?.data;
  const params = useSearchParams();
  const pathname = usePathname();
  const isNewParams = params?.get("new") || "";
  const isNew = sessionStorage?.getItem(SUB_EXTRA_ID) || isNewParams;

  const type = params.get("type") || "BUSINESS";
  const [unitNumber, setUnitNumber] = useState("");
  const router = useRouter();
  // console.log(isNew);

  const initAgeCat = equipmentAge.find(
    (eq) => eq.id === user?.subscriptions[0]?.equipmentAgeCategory
  );

  // console.log(initAgeCat);
  const [selectedPredictions, setSelectedPredictions] = useState<any>(
    isNew
      ? {
          prediction: "",
          modal: false,
        }
      : {
          prediction: user?.subscription?.coverageAddress,
          modal: false,
        }
  );

  const planId = params?.get("planId");

  const {
    loadingSubsPlans,
    monthlyPlans,
    yearlylyPlans,
    singleSubPlans,
    handleCheckoutUpgrade,
    isCheckingout,
  } = usePricing(isUpgrade ? decodeURIComponent(planId?.trim()) : "");

  const stp = accountType?.find(
    (acc) => acc?.id === user?.subscriptions[0]?.subscriptionType
  );
  const [toggle, setToggle] = useState(
    isUpgrade && singleSubPlans?.billingFrequency === "ANNUALLY" ? true : false
  );

  console.log(stp);

  useEffect(() => {
    if (isUpgrade && singleSubPlans?.billingFrequency === "ANNUALLY") {
      setToggle(true);
    } else {
      setToggle(false);
    }
  }, [isUpgrade, singleSubPlans]);
  // console.log(singleSubPlans);

  const [dropdown, setDropdown] = useState<any>(isNew ? null : initAgeCat);

  const [paymentInfo, setPaymentInfo] = useState({
    info: {},
    open: false,
  });
  const [subType, setSubType] = useState<{
    name: string;
    tag: string;
    variant: string;
    icon: StaticImageData;
    id: string;
  }>(isNew ? null : stp);
  const { handleLogout } = useAuthentication();

  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanAlt, setSelectedPlanAlt] = useState(null);
  const handleOPENMODAL = (plan: any) => {
    setOpenModal(true);
    setSelectedPlan(plan);
  };
  const handleCLOSEMODAL = () => {
    setOpenModal(false);
    setSelectedPlan(null);
    setSelectedPlanAlt(null);
  };

  // console.log(user);

  // console.log(isNew);

  useEffect(() => {
    // if (isUpgrade) return;
    if (isNew) return;
    if (user?.subscriptions[0] && !isNew) {
      const initAgeCat = equipmentAge.find(
        (eq) => eq.id === user.subscriptions[0].equipmentAgeCategory
      );
      // console.log("new shite");
      setDropdown(initAgeCat || null);
      setSelectedPredictions({
        prediction: user.subscriptions[0].coverageAddress || "",
        modal: false,
      });

      // setSubType()
    }
  }, [user, isNew, isUpgrade]);

  // place near the top of your component
  const didInitType = useRef(false);

  useEffect(() => {
    if (didInitType.current) return;

    const desiredType = user?.subscriptions?.[0]?.subscriptionType;
    if (!desiredType) return; // wait until user is available

    const search = typeof window !== "undefined" ? window.location.search : "";
    const sp = new URLSearchParams(search);
    const existing = sp.get("type");

    if (existing) {
      // already has a type -> don't touch
      didInitType.current = true;
      return;
    }

    sp.set("type", desiredType); // set once
    const next = `${pathname}?${sp.toString()}`;

    const tp = accountType?.find((acc) => acc.id === desiredType);

    setSubType(tp);
    router.replace(next, { scroll: false });
    didInitType.current = true;
  }, [user, pathname, router]);

  // const setQueryParam = useCallback(
  //   (key: string, value?: string | null) => {
  //     const nextParams = new URLSearchParams(params.toString());
  //     if (!value) nextParams.delete(key);
  //     else nextParams.set(key, value);

  //     const nextUrl = `${pathname}${nextParams.size ? `?${nextParams}` : ""}`;
  //     const currentUrl = `${pathname}${params.size ? `?${params}` : ""}`;

  //     if (nextUrl !== currentUrl) router.replace(nextUrl, { scroll: false });
  //   },
  //   [pathname, params, router]
  // );

  // useEffect(() => {
  //   if (!subType?.id) return; // ⬅️ do nothing if we don't have a value yet
  //   setQueryParam("type", subType.id); // ⬅️ only set when we have a real value
  // }, [subType?.id, setQueryParam]);

  // console.log(subType);

  if (loadingCurUser || loadingSubsPlans) return <LoadingTemplate />;

  const plansToRender = toggle ? yearlylyPlans : monthlyPlans;
  const handleCloseInfoModal = () => setPaymentInfo({ info: {}, open: false });
  const handleOpenInfoModal = (item: any) => {
    if (!subType?.name) {
      toast.error("Select a subscription type to proceed ");
      return;
    }
    if (!selectedPredictions?.prediction) {
      toast.error("Kindly enter an address");
      return;
    }
    setPaymentInfo({ info: item, open: true });
    setSelectedPlanAlt({
      yearlylyPlans,
      monthlyPlans,
    });
  };

  // console.log(selectedPredictions?.prediction?.country);

  // console.log(singleSubPlans);

  // console.log(selectedPlan);

  // console.log(isUpgrade);

  return (
    <main className="w-full my-12  lg:px-8">
      {isUpgrade ? (
        <Modal isOpen={openModal} onClose={handleCLOSEMODAL}>
          <div className="flex-cols gap-3">
            <Text.Paragraph className="my-2 text-dark-400 text-base text-center">
              To Change your subscription Plan, kindly hit the proceed button
              bellow
            </Text.Paragraph>
            <div className="flex-rows gap-2">
              <Button
                // onClick={() => onSubmit()}
                // disabled={!acceptTerms || isCheckingout}
                className="cursor-pointer  mb-4 mt-8 min-h-10 relative w-full"
                onClick={() =>
                  handleCheckoutUpgrade({
                    subscriptionId: singleSubPlans?.id,
                    newPlanId: selectedPlan?._id,
                  })
                }
              >
                <Button.Text>
                  {isCheckingout ? "Checking out...." : "Proceed"}
                </Button.Text>
                {isCheckingout && (
                  <Button.Icon>
                    <ClipLoader size={20} color="#fff" />
                  </Button.Icon>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCLOSEMODAL}
                // disabled={isCheckingout}
                className="cursor-pointer  mb-4 mt-8 min-h-10 relative w-full"
              >
                <Button.Text>Cancel</Button.Text>
              </Button>
            </div>
          </div>
        </Modal>
      ) : (
        <Modal isOpen={paymentInfo.open} onClose={handleCloseInfoModal}>
          <PaymentModal
            onClose={handleCloseInfoModal}
            plan={paymentInfo?.info}
            dropdown={dropdown}
            selectedPredictions={selectedPredictions}
            setDropdown={setDropdown}
            setSelectedPredictions={setSelectedPredictions}
            unitNUmber={unitNumber}
            isUpgrade={isUpgrade}
            equivalentYearlyPlan={selectedPlanAlt}
          />
        </Modal>
      )}

      {isUpgrade ? (
        <>
          <Button
            onClick={() => {
              router.back();
              sessionStorage.removeItem("type");
            }}
            variant="secondary"
          >
            <Button.Icon>
              <CgChevronLeft size={24} color="#000" />
            </Button.Icon>
            <Button.Text>Back</Button.Text>
          </Button>
          <Text.Heading className="text-xl lg:text-3xl text-center">
            Change Your Subscription Plan
          </Text.Heading>
          <Text.Paragraph className="my-2 text-dark-400 text-sm text-center">
            Select a different Plan from your current one
          </Text.Paragraph>
          <div className="flex items-center justify-center gap-2 text-dark-400 ">
            <Text.Paragraph className="text-dark-400 text-sm lg:text-base text-nowrap">
              Billed monthly
            </Text.Paragraph>

            <ToggleBtn toggle={toggle} onClick={() => setToggle((tg) => !tg)} />

            <Text.Paragraph className="text-green-500 text-sm lg:text-base">
              Bill annually
              <span className="font-semibold sm:ml-1">
                (Save one month, sign up annually, pay up front)
              </span>
            </Text.Paragraph>
          </div>
        </>
      ) : (
        <>
          {isNew ? (
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="mb-4"
            >
              <Button.Icon>
                <CgChevronLeft size={24} color="#000" />
              </Button.Icon>
              <Button.Text>Back</Button.Text>
            </Button>
          ) : (
            <div className="w-full flex justify-end">
              <Button onClick={handleLogout}>
                <Button.Icon>
                  <Image
                    src={icons.logoutIcon}
                    height={24}
                    width={24}
                    alt="Logout icon"
                  />
                </Button.Icon>
                <Button.Text>logout</Button.Text>
              </Button>
            </div>
          )}
          <div className="flex-col-center w-full mb-8 ">
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

              <ToggleBtn
                toggle={toggle}
                onClick={() => setToggle((tg) => !tg)}
              />

              <Text.Paragraph className="text-green-500 text-sm lg:text-base">
                Bill annually
                <span className="font-semibold sm:ml-1">
                  (Save one month, sign up annually, pay up front)
                </span>
              </Text.Paragraph>
            </div>
          </div>
          {
            <div className="flex-col gap-4 mb-4 ">
              <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00 ">
                Subscription Type
              </Text.Paragraph>
              <Dropdown className="w-full">
                <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
                  <Text.Paragraph className="text-dark-500">
                    {subType?.name || "Select Subscription type"}
                  </Text.Paragraph>
                </Dropdown.Trigger>
                <Dropdown.Content className="w-full bg-white">
                  <Dropdown.Label>
                    <Text.Paragraph className="text-dark-500">
                      Select Subscription type
                    </Text.Paragraph>
                  </Dropdown.Label>

                  {accountType?.map((item) => (
                    <Dropdown.Item
                      key={item.id}
                      className="border-b border-b-dark-200"
                      // when user picks a subtype
                      onClick={() => {
                        setSubType(item);
                        // sync the URL here instead of a separate effect
                        const next = new URLSearchParams(params.toString());
                        next.set("type", item.id);
                        router.replace(`${pathname}?${next.toString()}`, {
                          scroll: false,
                        });
                      }}
                    >
                      <Text.Paragraph className="text-dark-200">
                        {item?.name}
                      </Text.Paragraph>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Content>
              </Dropdown>
            </div>
          }
          <div className="flex-col gap-4 mb-4 ">
            <div className="flex-rows mb-2">
              <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
                {subType && subType.id.includes("BUSINESS")
                  ? "Business Address"
                  : " Home Address"}
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
            <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
              Unit number
              <span className="font-light text-xs sm:ml-1">(optional)</span>
            </Text.Paragraph>
            <div className="flex-rows mb-2">
              <InputContainer>
                <input
                  placeholder="Unit number"
                  className="text-input"
                  onChange={(e) => setUnitNumber(e?.target?.value)}
                />
              </InputContainer>
            </div>
          </div>
          {/* <div className="flex-col gap-4 mb-4">
            <div className="flex-rows mb-2">
              <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
                Age of Equipment
                <span className="font-light text-xs sm:ml-1">
                  (Providing false information about your equipment’s age will
                  void your RepairFind subscription)
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
          </div> */}
          {dropdown?.id === "unknown" ? (
            <div className="flex-cols gap-2 my-4">
              <Text.Paragraph>
                *If you are not sure of your equipment age range, kindly proceed
                without subscription for now, an agent will visit your address
                to confirm, before you can proceed with your subscription
              </Text.Paragraph>
              <div>
                <Button
                  onClick={() => navigator.navigate("/dashboard", "replace")}
                >
                  <Button.Text>Proceed</Button.Text>
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
      <div
        className={` ${plansToRender?.length > 3 ? "grid-4" : "grid-3"} w-full`}
      >
        {plansToRender.map((pla: any, i: number) => {
          // console.log(dropdown?.id);
          let ids: string[] = [];
          // let curPlan;
          // if (dropdown)
          //   if (dropdown?.id === "5-8") {
          //     ids = [plansToRender[0]?._id];
          //   } else if (dropdown?.id === "9+") {
          //     ids = [
          //       plansToRender[0]?._id,
          //       plansToRender[1]?._id,
          //       // plansToRender[2]?._id,
          //     ];
          //   } else if (dropdown?.id === "unknown") {
          //     ids = plansToRender.map((id: any) => id?._id);
          //   } else {
          //     ids = [];
          //   }
          if (isUpgrade) {
            const index = plansToRender.findIndex(
              (pl: any) =>
                pl?.planType === singleSubPlans?.planType &&
                pl?.billingFrequency === singleSubPlans?.billingFrequency
            );

            let slicedPlans: any[] = [];

            if (index !== -1) {
              slicedPlans = plansToRender.slice(0, index + 1);

              // Stop at the first ANNUALLY plan (inclusive), if one exists in the slice
              // const annuallyIndex = slicedPlans.findIndex(
              //   (pl: any) => pl?.billingFrequency === "ANNUALLY"
              // );

              // if (annuallyIndex !== -1) {
              //   slicedPlans = slicedPlans.slice(0, annuallyIndex + 1);
              // }
            }

            // Apply equipmentAgeCategory filtering
            if (singleSubPlans?.equipmentAgeCategory === "5-8") {
              ids = [plansToRender[0]?._id, plansToRender[1]?._id];
            } else if (singleSubPlans?.equipmentAgeCategory === "9+") {
              ids = [
                plansToRender[0]?._id,
                plansToRender[1]?._id,
                plansToRender[2]?._id,
              ];
            } else {
              // Default fallback: use filtered sliced plans
              ids = slicedPlans.map((pl: any) => pl?._id);
            }
          }

          // console.log(curPlan);
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
              currentPlan
              item={pla as any}
              key={i}
              cycle={toggle ? "yearly" : "monthly"}
              blurItems={ids}
              onSelectPlan={isUpgrade ? handleOPENMODAL : handleOpenInfoModal}
            />
          );
        })}
      </div>
    </main>
  );
};

export default Pricingg;
