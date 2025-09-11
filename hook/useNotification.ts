import { notifications } from "@/lib/api/actions/dashboard-actions/dashboard/notifications";
import { formatError } from "@/lib/helpers";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export const useNotification = () => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const fetchNotifications = async ({ pageParam = 1 }) => {
    const response = await notifications.getUserNotification({
      page: pageParam,
      limit: 20,
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
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page;
      const totalPages = lastPage.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1, // ✅ Add this line to fix the TS error
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

  const allNotifications =
    data?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];

  const unreadCount = useMemo(() => {
    return allNotifications.filter((not) => !not.readAt).length;
  }, [allNotifications]);

  const handleReadNotifs = async (id: string) => {
    try {
      const res = notifications.readNotification(id);

      await refetch();
    } catch (error: any) {
      formatError(error);
      console.error("read error", error);
    }
  };
  const handleAllReadNotifs = async () => {
    try {
      const res = notifications.readAllNotification();
      await refetch();
    } catch (error: any) {
      formatError(error);
      console.error("read error", error);
    }
  };

  return {
    allNotifications,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    status,
    sentinelRef: setSentinel,
    handleReadNotifs,
    handleAllReadNotifs,
    unreadCount,
  };
};
