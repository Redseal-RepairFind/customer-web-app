"use client";

import { inbox } from "@/lib/api/actions/dashboard-actions/inbox-calls/inbox";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export const useMessages = () => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const observerRef2 = useRef<HTMLDivElement | null>(null);
  const [sentinel2, setSentinel2] = useState<HTMLDivElement | null>(null);

  const params = useSearchParams();
  const page = params.get("page") || "1";
  const limit = params.get("limit") || "20";

  const { chatId } = useParams();

  const {
    data: singleChat,
    isLoading: isLoadingSingleChat,
    refetch: fefetchSingleChat,
  } = useQuery({
    queryKey: ["single-conversation", chatId],
    queryFn: () => inbox?.getSingleConversation(chatId as string),
    enabled: Boolean(chatId),
  });

  const {
    data: allMessages,
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage,
    isLoading: isLoadingMessages,
    status: messagesStatus,
    refetch: refetchMessages,
  } = useInfiniteQuery({
    queryKey: ["chats", page, limit],
    queryFn: () =>
      inbox.getConversations({
        page: Number(page),
        limit: Number(limit),
      }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data;
      const currentPage = Number(meta.currentPage);
      const totalPages = meta.lastPage;
      // console.log(currentPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
  const {
    data: allChatMessages,
    fetchNextPage: fetchNextChatMessagesPage,
    hasNextPage: hasNextChatMessagesPage,
    isFetchingNextPage: isFetchingNextChatMessagesPage,
    isLoading: isLoadingChatMessages,
    status: messagesChatStatus,
    refetch: refetchChatMessages,
  } = useInfiniteQuery({
    queryKey: ["chat-messages", page, limit],
    queryFn: () =>
      inbox.getSingleConversationMessages({
        page: Number(page),
        limit: Number(limit),
        id: chatId as string,
      }),
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
    if (!sentinel || !hasNextMessagesPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextMessagesPage) {
          fetchNextMessagesPage();
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
  }, [sentinel, hasNextMessagesPage, fetchNextMessagesPage]);

  const flattenedMessages = useMemo(() => {
    return allMessages?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
  }, [allMessages]);

  useEffect(() => {
    if (!sentinel2 || !hasNextChatMessagesPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextChatMessagesPage) {
          fetchNextChatMessagesPage();
        }
      },
      {
        threshold: 1.0,
      }
    );

    observer.observe(sentinel2);
    observerRef2.current = sentinel2;

    return () => {
      if (observerRef2.current) {
        observer.unobserve(observerRef2.current);
      }
    };
  }, [sentinel2, hasNextChatMessagesPage, fetchNextChatMessagesPage]);

  const flattenedChatMessages = useMemo(() => {
    return (
      allChatMessages?.pages.flatMap((page) => page?.data?.data ?? []) ?? []
    );
  }, [allChatMessages]);

  return {
    allMessages,
    fetchNextMessagesPage,
    hasNextMessagesPage,
    isFetchingNextMessagesPage,
    messagesStatus,
    refetchMessages,
    isLoadingMessages,
    flattenedMessages,
    sentinelRef: setSentinel,
    singleChat,
    isLoadingSingleChat,
    fefetchSingleChat,allChatMessages,
fetchNextChatMessagesPage,
hasNextChatMessagesPage,
isFetchingNextChatMessagesPage,
isLoadingChatMessages,
messagesChatStatus,
refetchChatMessages,
flattenedChatMessages,
  };
};
