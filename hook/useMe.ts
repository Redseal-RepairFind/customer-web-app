import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePageNavigator } from "./navigator";

export const useUser = () => {
  const { navigator } = usePageNavigator();
  const {
    data: curUser,
    isLoading: loadingCurUser,
    refetch: refetchingCurUser,
    isRefetching: isRefetchingCurUser,
  } = useQuery<any>({
    queryKey: ["cur-user"],
    queryFn: pricingActions.getMe,
  });

  // console.log(
  //   curUser?.data?.subscription?.equipmentAgeCategory
  //     ?.toLowerCase()
  //     ?.includes("unknown")
  // );

  useEffect(() => {
    if (!curUser?.data) return; // wait for user data

    const location = typeof window !== "undefined" ? window.location : null;
    const pathname = location?.pathname || "/";
    const allowList = [
      "/pricing",
      "/subscriptions",
      "/subscriptions/new",
      "/plans",
    ];

    // allow subscription-related pages at will
    const onAllowedPage = allowList.some((base) => pathname.startsWith(base));
    if (onAllowedPage) return;

    const plans = curUser?.data?.subscriptions ?? [];
    const isUnknown =
      plans.length > 0 &&
      plans.some((p: any) =>
        p?.equipmentAgeCategory?.toLowerCase?.().includes("unknown")
      );
    const isActive =
      plans.length > 0 &&
      plans.some((p: any) => p?.status?.toLowerCase?.().includes("active"));

    const target = isUnknown || isActive ? "/dashboard" : "/pricing";

    // avoid pointless navigate if we're already there
    if (pathname === target) return;

    // avoid double navigate in Strict Mode
    let didNav = (window as any).__didInitialNav__;
    if (didNav && pathname !== target) {
      // already navigated once this render cycle
    } else {
      (window as any).__didInitialNav__ = true;
      navigator.navigate(target, "replace");
    }
  }, [curUser?.data]);

  return {
    isRefetchingCurUser,
    loadingCurUser,
    curUser,
    refetchingCurUser,
  };
};
