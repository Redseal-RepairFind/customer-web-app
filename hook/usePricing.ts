"use client";

import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { formatError } from "@/lib/helpers";
import { SubscriptionType, UpgradeType } from "@/utils/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { usePageNavigator } from "./navigator";
import { useSearchParams } from "next/navigation";

type SubsPage = {
  data: any[]; // replace with your Subscription type
  meta?: { page: number; totalPages?: number; hasNextPage?: boolean };
  stats?: any;
};

export const usePricing = (planId?: string) => {
  const [isCheckingout, setIsCheckingOut] = useState(false);
  const { navigator, curPathname } = usePageNavigator();
  const searchParams = useSearchParams();
  const [singleSubPlans, setSubPlans] = useState<any>();
  const limit = searchParams.get("limit") || "20";
  const page = searchParams.get("page") || "1";
  const planType = searchParams.get("planType");
  const search = searchParams.get("search") || "";

  const { data: subPlans, isLoading: loadingSubsPlans } = useQuery({
    queryKey: ["subscription_plan"],
    queryFn: () => pricingActions.getSubscriptionPlan(),
    // enabled: curPathname === "/pricing",
    staleTime: 5 * 60_000,
  });
  // const { data: singlePlans, isLoading: loadingSingleSubsPlans } = useQuery({
  //   queryKey: ["subscription_plan_single"],
  //   queryFn: () => pricingActions.getSingleSubscriptionPlan(planId),
  //   enabled: curPathname === "/upgrade_subscription" && Boolean(planId),
  //   staleTime: 5 * 60_000,
  // });

  const { data: request_subscriptions, isLoading: isLoadingRequestSub } =
    useQuery({
      queryKey: ["request_subscriptions", page, limit, planType, search],
      queryFn: () =>
        pricingActions.getUserSubscriptions({
          page: Number(page),
          limit: Number(limit),
          planType: planType as "RESIDENTIAL",
          search,
        }),
      staleTime: 5 * 60_000,
    });

  // ---- Infinite query for subscriptions ----
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery<SubsPage>({
    queryKey: ["subscriptions", { planType, search, limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      pricingActions.getUserSubscriptions({
        page: Number(pageParam) || 1,
        limit: Number(limit) || 20,
        planType: planType as "RESIDENTIAL",
        search,
      }),
    getNextPageParam: (lastPage) => {
      const { page, hasNextPage } = lastPage?.meta ?? {};
      return hasNextPage ? (page ?? 1) + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    // enabled: curPathname?.includes("/manage-subscription"),
  });

  // Flatten all loaded pages
  const subscriptions = useMemo(
    () => data?.pages.flatMap((p) => p?.data ?? { data }) ?? [],
    [data]
  );
  // const subscriptionsStats = useMemo(
  //   () => data?.pages.flatMap((p) => p?.stats ?? []) ?? {},
  //   [data]
  // );

  // Optional: derived total pages / page for UI
  const paginationMeta = data?.pages.at(-1)?.meta;

  // ---- IntersectionObserver sentinel ----
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "200px", // prefetch a bit early
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ---- Plans helpers ----
  const monthlyPlans = subPlans?.data?.filter((p: any) =>
    p?.name?.toLowerCase().includes("monthly")
  );
  const yearlylyPlans = subPlans?.data?.filter((p: any) =>
    p?.name?.toLowerCase().includes("annually")
  );

  // ---- Checkout ----
  const handleCheckout = async (payload: SubscriptionType) => {
    setIsCheckingOut(true);
    try {
      const res = await pricingActions.checkoutSubscriptionPlan(payload);
      toast.success(
        res?.message || res?.data?.message || "Session created successfully"
      );
      const url = res?.url || res?.data?.url;
      window.location.href = url;
    } catch (error) {
      const errMsg = formatError(error);
      console.error("CheckoutError", error);
      toast.error(errMsg || "checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };
  const handleCheckoutSession = async () => {
    setIsCheckingOut(true);
    try {
      const res = await pricingActions.createBillingPortal();
      toast.success(
        res?.message || res?.data?.message || "Session created successfully"
      );

      const url = res?.url || res?.data?.url;

      if (url && typeof window !== "undefined") {
        // ✅ open in new tab
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      const errMsg = formatError(error);
      console.error("CheckoutError", error);
      toast.error(errMsg || "checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCheckoutUpgrade = async (payload: UpgradeType) => {
    setIsCheckingOut(true);
    try {
      const res = await pricingActions.upgradeSubscriptionPlan(payload);
      toast.success(
        res?.message || res?.data?.message || "Session created successfully"
      );

      // console.log(res);

      navigator.navigate("/manage-subscription", "replace");
      // const url = res?.url || res?.data?.url;
      // window.location.href = url;
    } catch (error) {
      const errMsg = formatError(error);
      console.error("CheckoutError", error);
      toast.error(errMsg || "checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };
  const handleCancelPlan = async (payload: UpgradeType) => {
    setIsCheckingOut(true);
    try {
      const res = await pricingActions.cancelSubscriptionPlan(payload);
      toast.success(
        res?.message || res?.data?.message || "Plan cancelled successfully"
      );
      // const url = res?.url || res?.data?.url;
      // window.location.href = url;

      await refetch();
    } catch (error) {
      const errMsg = formatError(error);
      console.error("CheckoutError", error);
      toast.error(errMsg || "checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    if (curPathname === "/upgrade_subscription" && Boolean(planId)) {
      const plan = subscriptions?.find((sub) => sub?.id === planId);

      setSubPlans(plan);
    }
  }, [curPathname, planId, subscriptions]);

  return {
    // plans
    subPlans,
    loadingSubsPlans,
    monthlyPlans,
    yearlylyPlans,

    // subscriptions (infinite)
    subscriptions,
    subscriptionsStats: data?.pages,
    status, // "pending" | "error" | "success"
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    sentinelRef, // attach this to a <div /> at the end of your list
    paginationMeta,

    // paginated subs
    request_subscriptions,
    isLoadingRequestSub,

    // checkout
    handleCheckout,
    isCheckingout,
    curPathname,
    handleCheckoutUpgrade,
    handleCancelPlan,

    singleSubPlans,
    // loadingSingleSubsPlans,

    handleCheckoutSession,
  };
};
