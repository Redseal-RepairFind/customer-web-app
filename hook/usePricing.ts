"use client";

import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { formatError } from "@/lib/helpers";
import { SubscriptionType } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageNavigator } from "./navigator";

export const usePricing = () => {
  const [isCheckingout, setIsCheckingOut] = useState(false);
  const { navigator } = usePageNavigator();
  const { data: subPlans, isLoading: loadingSubsPlans } = useQuery({
    queryKey: ["subscription_plan"],
    queryFn: pricingActions.getSubscriptionPlan,
  });

  const monthlyPlans = subPlans?.data?.filter((plans: any) =>
    plans?.name?.toLowerCase().includes("monthly")
  );
  const yearlylyPlans = subPlans?.data?.filter((plans: any) =>
    plans?.name?.toLowerCase().includes("annually")
  );

  const handleCheckout = async (payload: SubscriptionType) => {
    setIsCheckingOut(true);
    try {
      const res = await pricingActions.checkoutSubscriptionPlan(payload);

      toast.success(
        res?.message || res?.data?.message || "Session created successfully"
      );

      console.log(res);

      const url = res?.url || res?.data?.url;
      window.open(url, "_blank", "noopener,noreferrer");

      navigator.navigate("/home", "replace");
    } catch (error) {
      const errMsg = formatError(error);
      console.error("CheckoutError", error);
      toast.error(errMsg || "checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    subPlans,
    loadingSubsPlans,
    monthlyPlans,
    yearlylyPlans,
    handleCheckout,
    isCheckingout,
  };
};
