"use client";

import { InputContainer } from "@/components/auth/signup-item";
import Button from "@/components/ui/custom-btn";
import PlacesAutocomplete from "@/components/ui/places-autocomplete";
import LoadingTemplate from "@/components/ui/spinner";
import Text from "@/components/ui/text";
import { useUser } from "@/hook/useMe";
import { usePricing } from "@/hook/usePricing";
import { formatCurrency } from "@/lib/helpers";
import { SubscriptionType } from "@/utils/types";
import { useState } from "react";
import toast from "react-hot-toast";
import { CgCheck, CgChevronDown } from "react-icons/cg";

const PaymentModal = ({
  onClose,
  subPlan,
  dropdown,
  selectedPredictions,
  setSelectedPredictions,
}: {
  onClose: () => void;
  subPlan: any;
  dropdown?: {
    name: string;
    id: string;
  };
  setDropdown?: (eq: any) => void;
  selectedPredictions: {
    prediction: any;
    openModal: boolean;
  };
  setSelectedPredictions: (pr?: any) => void;
}) => {
  // const [selectedPredictions, setSelectedPredictions] = useState<any>({
  //   predictions: {},
  //   modal: false,
  // });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { handleCheckout, isCheckingout } = usePricing();

  const { curUser } = useUser();

  const user = curUser?.data;
  // console.log(curUser?.data?.subscription?.subscriptionType);

  const onSubmit = async () => {
    const predictions = selectedPredictions?.prediction;

    if (!predictions?.latitude) {
      toast.error("Enter a valid address");
      return;
    }
    if (!dropdown?.id) {
      toast.error("Select equipment age");
      return;
    }
    const payload = {
      coverageAddress: {
        latitude: predictions?.latitude || "",
        longitude: predictions?.longitude || "",
        address: predictions?.address || "",
        city: predictions?.city || "",
        country: predictions?.country || "",
        state: predictions?.region || "",
      },
      planId: subPlan?._id,
      equipmentAgeRange: dropdown?.id,
      subscriptionType: curUser?.data?.subscription?.subscriptionType,
      ...(user?.businessName ? { businessName: user?.businessName } : null),
    };

    await handleCheckout(payload as SubscriptionType);
  };

  // console.log(selectedPredictions);

  return (
    <div className="w-full flex-cols gap-4 z-[1000]">
      <Text.SubHeading className="text-lg font-semibold">
        Confirm payment information for your subscription
      </Text.SubHeading>
      {/* <div className="flex-col gap-4 mb-4">
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
                className={`  `}
                onClick={() => setDropdown?.(eq)}
              >
                <Text.Paragraph className="text-dark-500">
                  {eq.name}
                </Text.Paragraph>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div> */}
      <div className="flex-col gap-4 mb-4 w-full relative">
        <Text.Paragraph className="font-semibold">Address</Text.Paragraph>

        {/* <InputContainer> */}
        <PlacesAutocomplete
          selectedPredictions={selectedPredictions}
          setSelectedPredictions={setSelectedPredictions}
          modal
        />
        {/* </InputContainer> */}
      </div>

      <div className="grid-2">
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">City</Text.Paragraph>

          <InputContainer>
            <input
              type="text"
              className="text-input"
              placeholder=""
              value={
                selectedPredictions?.prediction?.city ||
                selectedPredictions?.prediction?.region ||
                ""
              }
              disabled
            />
          </InputContainer>
        </div>
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">Country</Text.Paragraph>

          <InputContainer>
            <input
              type="text"
              className="text-input"
              placeholder=""
              disabled
              value={
                selectedPredictions?.prediction?.country?.split(" ")?.[
                  selectedPredictions?.prediction?.country?.split(" ")?.length -
                    1
                ] || ""
              }
            />

            <CgChevronDown />
          </InputContainer>
        </div>
      </div>
      <div className="bg-light-500 min-h-30 rounded-lg p-2">
        <Text.Paragraph className="font-semibold">
          Subscription plan
        </Text.Paragraph>
        <div className=" border-b border-b-light-10 flex-row-between py-3">
          <Text.SmallText>{`${subPlan?.name?.split(" - ")[0]} - ${
            subPlan?.billingFrequency
          }`}</Text.SmallText>
          <Text.SmallText>
            {formatCurrency(subPlan?.priceDetails?.discountedPrice)}
          </Text.SmallText>
        </div>
        <div className="  flex-row-between py-3">
          <Text.SmallText className="font-semibold text-sm">
            Total
          </Text.SmallText>
          <Text.SmallText className="font-semibold text-sm">
            {formatCurrency(subPlan?.priceDetails?.discountedPrice)}
          </Text.SmallText>
        </div>
      </div>
      <Text.SubParagraph className="text-dark-500">
        Once payment has been processed, your subscription will be active.
      </Text.SubParagraph>

      <div className="flex-rows gap-2">
        <button
          className={`h-4 w-4 rounded-sm border border-dark-300 ${
            acceptTerms ? "bg-dark" : ""
          } flex-row-center cursor-pointer`}
          onClick={() => {
            setAcceptTerms((acc) => !acc);
            // setExtraInfo(ext=)
          }}
        >
          {acceptTerms ? <CgCheck color="#ffffff" /> : null}
        </button>

        <Text.Paragraph className="text-sm lg:text-base">
          I agree to the Terms of Service*{" "}
        </Text.Paragraph>
      </div>

      <div className="flex-rows items-center gap-4">
        <Button
          onClick={() => onSubmit()}
          disabled={!acceptTerms || isCheckingout}
          className="cursor-pointer  mb-4 mt-8 min-h-10 relative w-full"
        >
          {isCheckingout ? (
            <LoadingTemplate isMessage={false} variant="small" />
          ) : (
            <Button.Text>Confirm Subscription</Button.Text>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isCheckingout}
          className="cursor-pointer  mb-4 mt-8 min-h-10 relative w-full"
        >
          <Button.Text>Cancel</Button.Text>
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;

{
  /* <div className="flex-col gap-4 mb-4">
        <Text.Paragraph className="font-semibold">Name on Card</Text.Paragraph>

        <InputContainer>
          <input
            type="text"
            className="text-input"
            placeholder="Enter name on card"
          />
        </InputContainer>

        <Text.SmallText className="text-dark-100 text-sm">
          All fields required, unless specified
        </Text.SmallText>
      </div> */
}
{
  /* <div className="grid-3">
        <div className="flex flex-col">
          <Text.Paragraph className="font-semibold">Expiry Date</Text.Paragraph>
          <InputContainer>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength={5}
              className=" rounded-lg focus:ring-0 focus:outline-none"
            />
          </InputContainer>
        </div>
        <div className="flex flex-col">
          <Text.Paragraph className="font-semibold">
            Security Code
          </Text.Paragraph>
          <InputContainer>
            <input
              type="password"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="***"
              maxLength={4}
              className="  rounded-lg  focus:ring-0 focus:outline-none"
            />
          </InputContainer>
        </div>
        <div className="flex flex-col">
          <Text.Paragraph className="font-semibold">
            Billing Postal code
          </Text.Paragraph>
          <InputContainer>
            <input
              type="text"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="Postal code"
              // maxLength={4}
              className="  rounded-lg  focus:ring-0 focus:outline-none"
            />
          </InputContainer>
        </div>
      </div> */
}
{
  /* <div className="flex-rows gap-2">
        <button
          className={`h-4 w-4 rounded-sm border border-dark-300 ${
            acceptTerms ? "bg-dark" : ""
          } flex-row-center cursor-pointer`}
          onClick={() => {
            setAcceptTerms((acc) => !acc);
            // setExtraInfo(ext=)
          }}
        >
          {acceptTerms ? <CgCheck color="#ffffff" /> : null}
        </button>

        <Text.Paragraph className="text-sm lg:text-base">
          I Understand that this credit card will be used for any RepairFind
          Subscription I Make
        </Text.Paragraph>
      </div> */
}
