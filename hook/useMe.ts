import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePageNavigator } from "./navigator";

export const useUser = () => {
  const { navigator, curPathname } = usePageNavigator();

  // const {} = usePageNavigator()
  const {
    data: curUser,
    isLoading: loadingCurUser,
    refetch: refetchingCurUser,
    isRefetching: isRefetchingCurUser,
  } = useQuery<any>({
    queryKey: ["cur-user"],
    queryFn: pricingActions.getMe,
  });
  const {
    data: curUser4PaymentMethod,
    isLoading: loadingCurUser4PaymentMethod,
    refetch: refetchingCurUser4PaymentMethod,
    isRefetching: isRefetchingCurUser4PaymentMethod,
  } = useQuery<any>({
    queryKey: ["cur-user-payment"],
    queryFn: () =>
      pricingActions.getMe$patmentMethod({
        include: "stripePaymentMethods",
      }),
    enabled: curPathname === "/manage-subscription",
  });

  // console.log(
  //   curUser?.data?.subscription?.equipmentAgeCategory
  //     ?.toLowerCase()
  //     ?.includes("unknown")
  // );

  // console.log(curUser);

  // useEffect(() => {
  //   if (!curUser?.data) return; // wait for user data

  //   const w = typeof window !== "undefined" ? window : null;
  //   if (!w) return;

  //   const pathname = w.location.pathname;

  //   // allow pages that should NOT be auto-redirected away from
  //   const allowList = [
  //     "/pricing",
  //     "/subscriptions",
  //     "/inbox",
  //     "/maintenance-log", // 👈 add this
  //     "/notifications", // (optionally add subpaths you use)
  //     "/manage-subscription",
  //     "/referal",
  //     "/repair-request",
  //     // add others you actually want to stay on:
  //     // '/account', '/settings', etc.
  //   ];

  //   // treat as allowed if pathname starts with any base prefix
  //   const onAllowedPage = allowList.some(
  //     (base) => pathname === base || pathname.startsWith(base + "/")
  //   );
  //   if (onAllowedPage) return;

  //   const plans = curUser?.data?.subscriptions ?? [];
  //   const isUnknown =
  //     plans.length > 0 &&
  //     plans.some((p: any) =>
  //       p?.equipmentAgeCategory?.toLowerCase?.().includes("unknown")
  //     );
  //   const isActive =
  //     plans.length > 0 &&
  //     plans.some((p: any) => p?.status?.toLowerCase?.().includes("active"));

  //   const target = isUnknown || isActive ? "/dashboard" : "/pricing";

  //   // idempotent guard
  //   if (pathname === target) return;

  //   // avoid StrictMode double-run: component-level ref
  //   const ranRef =
  //     (w as any).__nav_ran_ref || ((w as any).__nav_ran_ref = { ran: false });
  //   if (ranRef.ran) return;
  //   ranRef.ran = true;

  //   navigator.navigate(target, "replace");
  // }, [curUser?.data, navigator]);
  return {
    isRefetchingCurUser,
    loadingCurUser,
    curUser,
    refetchingCurUser,
    curUser4PaymentMethod,
    loadingCurUser4PaymentMethod,
    refetchingCurUser4PaymentMethod,
    isRefetchingCurUser4PaymentMethod,
  };
};
