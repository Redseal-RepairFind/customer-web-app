"use client";

import { useMemo, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { repairActions } from "@/lib/api/actions/dashboard-actions/repair-actions/repair";

type ApiPage<T = any> = {
  message: string;
  success: boolean;
  data: {
    page: string; // "1"
    currentPage: number; // 1
    lastPage: number; // 1
    limit: number; // 10
    totalItems: number; // 3
    data: T[]; // items
  };
};

type HookOpts = { syncPageToUrl?: boolean };

export function useMaintenanceInfinite({
  syncPageToUrl = false,
}: HookOpts = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const statusParam =
    params.get("status") ??
    "BOOKED,ONGOING,COMPLETED,DISPUTED,CANCELED,EXPIRED,COMPLETED_SITE_VISIT,PENDING";
  const typeParam = (params.get("type") ?? "INSPECTION").toUpperCase() as
    | "REPAIR"
    | "INSPECTION";
  const limitParam = Number(params.get("limit") ?? "10");

  const queryKey = useMemo(
    () => ["repairs-infinite", statusParam, typeParam, limitParam],
    [statusParam, typeParam, limitParam]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<ApiPage>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      repairActions.fetchRepairRequest({
        page: Number(pageParam),
        limit: limitParam,
        type: typeParam,
        status: statusParam.toUpperCase(),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const curr = Number(lastPage?.data?.currentPage ?? 1);
      const total =
        Number(lastPage?.data?.lastPage) ||
        Math.ceil(
          Number(lastPage?.data?.totalItems ?? 0) /
            Number(lastPage?.data?.limit ?? limitParam)
        ) ||
        1;
      return curr < total ? curr + 1 : undefined;
    },
    refetchOnWindowFocus: false,
  });

  /** Flatten items for rendering */
  const items = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages.flatMap((p) =>
      Array.isArray(p?.data?.data) ? p.data.data : []
    );
  }, [data]);

  /** IntersectionObserver sentinel */
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (syncPageToUrl) {
            const nextPage = (data?.pages?.length ?? 1) + 1;
            const newParams = new URLSearchParams(params.toString());
            newParams.set("page", String(nextPage));
            router.replace(`${pathname}?${newParams.toString()}`, {
              scroll: false,
            });
          }
          fetchNextPage();
        }
      },
      { rootMargin: "200px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data?.pages?.length,
    syncPageToUrl,
    router,
    pathname,
    params,
  ]);

  return {
    items,
    pages: data?.pages ?? [],
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    loadMoreRef,
  };
}
