"use client";

import { InputContainer } from "@/components/auth/signup-item";
import SubscriptionAgreementPage from "@/components/public/sub-terms";
import Button from "@/components/ui/custom-btn";
import Dropdown from "@/components/ui/dropdown";
import PlacesAutocomplete from "@/components/ui/places-autocomplete";
import LoadingTemplate from "@/components/ui/spinner";
import PortalModal from "@/components/ui/terms-portal";
import Text from "@/components/ui/text";
import ToggleBtn from "@/components/ui/toggle-btn";
import { useUser } from "@/hook/useMe";
import { usePricing } from "@/hook/usePricing";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CgCheck, CgChevronDown } from "react-icons/cg";

/* -------------------------- Types (local) -------------------------- */
type CouponResult = {
  success: boolean;
  message?: string;
  data?: {
    discount?: { finalAmount?: number; [k: string]: any };
    coupon?: { name?: string };
  };
  [k: string]: any;
};
type Status = "idle" | "validating" | "valid" | "invalid" | "error";

/* ---------------------- Tunables for validation -------------------- */
const MIN_COUPON_LEN = 5; // only validate when code length >= 5
const COUPON_DEBOUNCE_MS = 1000; // run after 1s of inactivity

/* ----------------------------- Component --------------------------- */
const PaymentModal = ({
  onClose,
  plan,
  dropdown,
  selectedPredictions,
  setSelectedPredictions,
  unitNUmber,
  isUpgrade,
  equivalentYearlyPlan,
}: {
  onClose: () => void;
  plan: any;
  dropdown?: { name: string; id: string };
  setDropdown?: (eq: any) => void;
  selectedPredictions: { prediction: any; openModal: boolean };
  setSelectedPredictions: (pr?: any) => void;
  unitNUmber?: string;
  isUpgrade: boolean;
  equivalentYearlyPlan: any;
}) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const {
    handleCheckout,
    isCheckingout,
    handleNewSubscription,
    handleValidateCoupon,
    payementMethods,
  } = usePricing();
  const [toggle, setToggle] = useState(plan?.billingFrequency === "ANNUALLY");
  const [termsModal, setTermsMoal] = useState(false);
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const newSub = searchParams.get("new");
  const { curUser, curUser4PaymentMethod } = useUser();
  const [stripePmd, setStripePmd] = useState<any>();
  const [couponCode, setCouponCode] = useState("");

  const user = curUser?.data;
  const [subPlan, setSubPlan] = useState(plan);

  useEffect(() => {
    const { yearlylyPlans, monthlyPlans } = equivalentYearlyPlan || {};
    if (toggle) {
      const curPlan = yearlylyPlans?.find(
        (pl: any) => pl?.planType === plan?.planType
      );
      setSubPlan(curPlan);
    } else {
      const curPlan = monthlyPlans?.find(
        (pl: any) => pl?.planType === plan?.planType
      );
      setSubPlan(curPlan);
    }
  }, [plan, toggle, equivalentYearlyPlan]);

  /* ------------------ Auto-validate coupon (no button) ------------------ */
  const [couponStatus, setCouponStatus] = useState<Status>("idle");
  const [couponRes, setCouponRes] = useState<CouponResult | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  // cache validated results per (code|plan) so we don't re-hit API
  const cacheRef = useRef(new Map<string, CouponResult>());

  // keep a stable reference to the validator to avoid retriggering effect
  const validateRef = useRef(handleValidateCoupon);
  useEffect(() => {
    validateRef.current = handleValidateCoupon;
  }, [handleValidateCoupon]);

  // sequence id so only the latest request updates state (prevents race/stale)
  const reqSeqRef = useRef(0);

  useEffect(() => {
    const code = (couponCode || "").trim().toUpperCase();
    const planId = subPlan?._id;

    // reset when empty/short/no plan
    if (!code || code.length < MIN_COUPON_LEN || !planId) {
      setCouponStatus("idle");
      setCouponRes(null);
      setCouponErr(null);
      return;
    }

    const key = `${code}|${planId}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setCouponRes(cached);
      setCouponStatus(cached.success ? "valid" : "invalid");
      setCouponErr(cached.success ? null : cached.message || "Invalid coupon");
      return;
    }

    setCouponStatus("validating");
    setCouponErr(null);

    const ctrl = new AbortController();
    const mySeq = ++reqSeqRef.current;

    const t = setTimeout(async () => {
      try {
        const res: any = await validateRef.current({
          planId,
          couponCode: code,
          // signal: ctrl.signal  // keep if your API accepts AbortSignal
        });

        // ignore stale responses
        if (mySeq !== reqSeqRef.current) return;

        cacheRef.current.set(key, res);
        setCouponRes(res);
        setCouponStatus(res?.success ? "valid" : "invalid");
        setCouponErr(res?.success ? null : res?.message || "Invalid coupon");
      } catch (e: any) {
        if (ctrl.signal.aborted || mySeq !== reqSeqRef.current) return;
        setCouponStatus("error");
        setCouponRes(null);
        setCouponErr(e?.message || "Unable to validate coupon");
      }
    }, COUPON_DEBOUNCE_MS); // run after 1s of inactivity

    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [couponCode, subPlan?._id]); // re-run once when input or plan changes

  /* ----------------------------- Pricing math ---------------------------- */
  const base = Number(subPlan?.priceDetails?.discountedPrice ?? 0);
  const applied =
    couponStatus === "valid"
      ? Number(couponRes?.data?.discount?.finalAmount ?? base)
      : base;
  const gst = applied * 0.05;
  const total = applied + gst;

  /* -------------------------------- Submit ------------------------------- */
  const onSubmit = async () => {
    const predictions = selectedPredictions?.prediction;

    if (!predictions?.latitude) {
      toast.error("Enter a valid address");
      return;
    }

    // if coupon present, only proceed when validated OK
    if (couponCode) {
      if (couponStatus === "validating") {
        toast.error("Validating coupon… please wait");
        return;
      }
      if (couponStatus === "invalid" || couponStatus === "error") {
        // toast.error(couponErr || "Invalid coupon");
        return;
      }
      // couponStatus === "valid" → continue
    }

    const payload = {
      coverageAddress: {
        latitude: predictions?.latitude || "",
        longitude: predictions?.longitude || "",
        address: predictions?.address || "",
        city: predictions?.city || "",
        country: predictions?.country || "",
        state: predictions?.region || "",
        ...(unitNUmber && { description: unitNUmber }),
      },
      planId: subPlan?._id,
      equipmentAgeCategory: dropdown?.id || "1-4",
      subscriptionType:
        type ||
        curUser?.data?.subscriptions?.[0]?.subscriptionType ||
        "RESIDENTIAL",
      businessName: user?.businessName || user?.name,
      ...(newSub && stripePmd && { paymentMethodId: stripePmd?.id }),
      ...(couponCode &&
        couponStatus === "valid" && {
          couponCode: couponCode.trim().toUpperCase(),
        }),
    };

    if (newSub && stripePmd?.id && stripePmd?.id !== 1) {
      await handleNewSubscription(payload as any);
    } else {
      await handleCheckout(payload as any);
    }
  };

  const pmd =
    curUser4PaymentMethod?.data?.stripePaymentMethods?.length > 0
      ? curUser4PaymentMethod?.data?.stripePaymentMethods
      : payementMethods?.data;

  return (
    <div className="w-full flex-cols gap-4 z-[1000]">
      {/* <PortalModal
        isOpen={termsModal}
        onClose={() => setTermsMoal(false)}
        closeOnBackdrop
        closeOnEsc
      >
        <SubscriptionAgreementPage />
      </PortalModal> */}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-2 text-dark-400 ">
        <Text.Paragraph className="text-dark-400 text-sm lg:text-base text-nowrap">
          Billed monthly
        </Text.Paragraph>
        <ToggleBtn toggle={toggle} onClick={() => setToggle((t) => !t)} />
        <Text.Paragraph className="text-green-500 text-sm lg:text-base">
          Bill annually
          <span className="font-semibold sm:ml-1">
            (Save one month, sign up annually, pay up front)
          </span>
        </Text.Paragraph>
      </div>

      <Text.SubHeading className="text-lg font-semibold">
        Confirm payment information for your Membership
      </Text.SubHeading>

      {/* Payment method (when newSub) */}
      {newSub && (
        <div className="flex-col gap-4 mb-4 w-full relative">
          <Text.Paragraph className="font-semibold">
            Select Payment Method
          </Text.Paragraph>

          <Dropdown className="w-full">
            <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
              <Text.Paragraph className="text-dark-500">
                {stripePmd?.card && (
                  <span className="font-bold text-xl text-blue-800">
                    {stripePmd?.card?.brand}
                  </span>
                )}{" "}
                {stripePmd?.card
                  ? `**** **** **** ${stripePmd?.card?.last4}`
                  : stripePmd?.id === 1
                  ? "New Card"
                  : "Select Payment method"}
              </Text.Paragraph>
            </Dropdown.Trigger>
            <Dropdown.Content className="w-full bg-white">
              <Dropdown.Label>
                <Text.Paragraph className="text-dark-500">
                  {"Select Payment method"}
                </Text.Paragraph>
              </Dropdown.Label>

              <Dropdown.Item
                onClick={() =>
                  setStripePmd({
                    id: 1,
                  })
                }
                className="border-b border-b-light-0"
              >
                New Card
              </Dropdown.Item>

              {pmd?.map((pd: any) => (
                <Dropdown.Item
                  key={pd.id}
                  className="border-b border-b-light-0"
                  onClick={() => setStripePmd(pd)}
                >
                  <Text.Paragraph className="text-dark-500">
                    <span className="font-bold text-xl text-blue-800">
                      {pd?.card?.brand}
                    </span>{" "}
                    **** **** **** {pd?.card?.last4}
                  </Text.Paragraph>
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown>
        </div>
      )}

      {/* Address */}
      <div className="flex-col gap-4 mb-4 w-full relative">
        <Text.Paragraph className="font-semibold">Address</Text.Paragraph>
        <PlacesAutocomplete
          selectedPredictions={selectedPredictions}
          setSelectedPredictions={setSelectedPredictions}
          modal
        />
      </div>

      {/* City / Country */}
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

      {/* Coupon */}
      <div className="flex-col gap-4 my-4">
        <Text.Paragraph className="font-semibold">
          Coupon code (optional)
        </Text.Paragraph>
        <InputContainer>
          <input
            type="text"
            className="text-input"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </InputContainer>

        {couponCode && (
          <Text.SmallText
            className={
              couponStatus === "valid"
                ? "text-green-600"
                : couponStatus === "invalid" || couponStatus === "error"
                ? "text-red-600"
                : "text-dark-400"
            }
          >
            {couponStatus === "validating" && "Checking…"}
            {couponStatus === "valid" && "Coupon applied"}
            {(couponStatus === "invalid" || couponStatus === "error") &&
              (couponErr || "Invalid coupon")}
          </Text.SmallText>
        )}
      </div>

      {/* Summary */}
      <div className="bg-light-500 min-h-30 rounded-lg p-2">
        <Text.Paragraph className="font-semibold">
          Membership plan
        </Text.Paragraph>
        <div className="border-b border-b-light-10">
          {couponStatus === "valid" && couponRes?.data?.coupon?.name && (
            <div className="flex-row-between py-3">
              <Text.SmallText>Coupon Applied</Text.SmallText>
              <Text.SmallText className="text-green-500 text-xs">
                {couponRes?.data?.coupon?.name}
              </Text.SmallText>
            </div>
          )}

          <div className="flex-row-between py-3">
            <Text.SmallText>{`${subPlan?.name?.split(" - ")[0]} - ${
              subPlan?.billingFrequency
            }`}</Text.SmallText>
            <Text.SmallText>{formatCurrency(applied)}</Text.SmallText>
          </div>
          <div className="flex-row-between py-3">
            <Text.SmallText>GST</Text.SmallText>
            <Text.SmallText>5%</Text.SmallText>
          </div>
        </div>

        <div className="flex-row-between py-3">
          <Text.SmallText className="font-semibold text-sm">
            Total
          </Text.SmallText>
          <Text.SmallText className="font-semibold text-sm">
            {formatCurrency(total)}
          </Text.SmallText>
        </div>
      </div>

      <Text.SubParagraph className="text-dark-500">
        Once payment has been processed, your Membership will be active.
      </Text.SubParagraph>

      {/* Terms */}
      <div className="flex-rows gap-2">
        <button
          className={`h-4 w-4 rounded-sm border border-dark-300 ${
            acceptTerms ? "bg-dark" : ""
          } flex-row-center cursor-pointer`}
          onClick={() => setAcceptTerms((acc) => !acc)}
        >
          {acceptTerms ? <CgCheck color="#ffffff" /> : null}
        </button>

        <Text.Paragraph className="text-sm lg:text-base">
          I agree to the{" "}
          <Link
            href={`/subscription_agreement?type=${
              type || curUser?.data?.planCategory
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Terms of Service
          </Link>
          *
        </Text.Paragraph>
      </div>

      {/* Actions */}
      <div className="flex-rows items-center gap-4">
        <Button
          onClick={onSubmit}
          disabled={
            !acceptTerms ||
            isCheckingout ||
            couponStatus === "validating" ||
            (couponCode &&
              (couponStatus === "invalid" || couponStatus === "error"))
          }
          className="cursor-pointer mb-4 mt-8 min-h-10 relative w-full"
        >
          {isCheckingout ? (
            <LoadingTemplate isMessage={false} variant="small" />
          ) : (
            <Button.Text>{"Confirm Membership"}</Button.Text>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isCheckingout}
          className="cursor-pointer mb-4 mt-8 min-h-10 relative w-full"
        >
          <Button.Text>Cancel</Button.Text>
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
