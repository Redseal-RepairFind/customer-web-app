"use client";

import { callApi } from "@/lib/api/actions/dashboard-actions/inbox-calls/calls";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

export const useCallLogs = () => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const fetchCallLogs = async ({ pageParam = 1 }) => {
    const response = await callApi.getCallLogs({
      page: pageParam,
      limit: 10,
    });

    return response;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["user_notifications"],
    queryFn: fetchCallLogs,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data;
      const currentPage = Number(meta.currentPage);
      const totalPages = meta.lastPage;
      // console.log(currentPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 1.0,
      }
    );

    observer.observe(sentinel);
    observerRef.current = sentinel;

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [sentinel, hasNextPage, fetchNextPage]);

  const allLogs = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
  }, [data]);

  return {
    setSentinel,
    allLogs,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
    refetch,
  };
};
