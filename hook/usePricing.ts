"use client";

import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { formatError } from "@/lib/helpers";
import { SubscriptionType } from "@/utils/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { usePageNavigator } from "./navigator";
import { useSearchParams } from "next/navigation";

type SubsPage = {
  data: any[]; // replace with your Subscription type
  meta?: { page: number; totalPages?: number; hasNextPage?: boolean };
};

export const usePricing = () => {
  const [isCheckingout, setIsCheckingOut] = useState(false);
  const { navigator, curPathname } = usePageNavigator();

  const { data: subPlans, isLoading: loadingSubsPlans } = useQuery({
    queryKey: ["subscription_plan"],
    queryFn: pricingActions.getSubscriptionPlan,
    staleTime: 5 * 60_000,
  });

  const searchParams = useSearchParams();
  const limit = searchParams.get("limit") || "20";
  const page = searchParams.get("page") || "1";
  const planType = searchParams.get("planType") || "";
  const search = searchParams.get("search") || "";

  const { data: request_subscriptions, isLoading: isLoadingRequestSub } =
    useQuery({
      queryKey: ["request_subscriptions", page, limit, planType, search],
      queryFn: () =>
        pricingActions.getUserSubscriptions({
          page: Number(page),
          limit: Number(limit),
          planType,
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
        planType,
        search,
      }),
    getNextPageParam: (lastPage) => {
      const { page, hasNextPage } = lastPage?.meta ?? {};
      return hasNextPage ? (page ?? 1) + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled: curPathname?.includes("/manage-subscription"),
  });

  // Flatten all loaded pages
  const subscriptions = useMemo(
    () => data?.pages.flatMap((p) => p?.data ?? []) ?? [],
    [data]
  );

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

  return {
    // plans
    subPlans,
    loadingSubsPlans,
    monthlyPlans,
    yearlylyPlans,

    // subscriptions (infinite)
    subscriptions, // flattened list for rendering
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
  };
};
