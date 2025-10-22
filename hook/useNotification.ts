"use client";

import { notifications } from "@/lib/api/actions/dashboard-actions/dashboard/notifications";
import { repairActions } from "@/lib/api/actions/dashboard-actions/repair-actions/repair";
import { formatError, readStringCookie } from "@/lib/helpers";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export const useNotification = () => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const observerRefAction = useRef<HTMLDivElement | null>(null);
  const [sentinelAction, setSentinelAction] = useState<HTMLDivElement | null>(
    null
  );
  const [inspecting, setInspecting] = useState(false);

  const token = readStringCookie(
    process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? "reparfind_token"
  );

  // console.log(token);

  const { data: notificationBagde, isLoading: isLoadingBagde } = useQuery({
    queryKey: ["badge_counts"],
    queryFn: notifications.getBadgeCounts,
  });

  const fetchNotifications = async ({ pageParam = 1 }) => {
    const response = await notifications.getUserNotification({
      page: pageParam,
      limit: 10,
    });

    return response;
  };
  const fetchQuickActions = async ({ pageParam = 1 }) => {
    const response = await notifications.getUserQuickActions({
      page: pageParam,
      limit: 10,
    });

    return response;
  };

  const handleSetInspection = async (payload: {
    date: string;
    time: string;
    subscriptionId: string;
    emergency: boolean;
  }) => {
    try {
      setInspecting(true);

      await repairActions.inspectionSchedule(payload);

      toast.success("Inspection schedule set successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setInspecting(false);
    }
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
      const meta = lastPage?.data;
      const currentPage = Number(meta.currentPage);
      const totalPages = meta.lastPage;
      // console.log(currentPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(token),
  });

  const {
    data: actions,
    fetchNextPage: fetchNextActs,
    hasNextPage: hasNextActs,
    isFetchingNextPage: isFetchingNextPageActs,
    isLoading: isLoadingACtions,
    status: statusACts,
    refetch: refetchActs,
  } = useInfiniteQuery({
    queryKey: ["user_quickACts"],
    queryFn: fetchQuickActions,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data;
      const currentPage = Number(meta.currentPage);
      const totalPages = meta.lastPage;
      // console.log(currentPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(token),
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

  const allNotifications = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
  }, [data]);

  useEffect(() => {
    if (!sentinelAction || !hasNextActs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextActs) {
          fetchNextActs();
        }
      },
      {
        threshold: 1.0,
      }
    );

    observer.observe(sentinelAction);
    observerRefAction.current = sentinelAction;

    return () => {
      if (observerRefAction.current) {
        observer.unobserve(observerRefAction.current);
      }
    };
  }, [sentinelAction, hasNextActs, fetchNextActs]);

  const allActions = useMemo(() => {
    return actions?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
  }, [actions]);

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
    notificationBagde,
    isLoadingBagde,

    // ACtions
    actions,
    fetchNextActs,
    hasNextActs,
    isFetchingNextPageActs,
    isLoadingACtions,
    statusACts,
    refetchActs,
    allActions,
    sentinelAction: setSentinelAction,
    handleSetInspection,
    inspecting,
  };
};
