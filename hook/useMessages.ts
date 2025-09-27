"use client";

import { inbox } from "@/lib/api/actions/dashboard-actions/inbox-calls/inbox";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Message } from "@/utils/types";
import { useSocket } from "@/contexts/socket-contexts";

export const useMessages = () => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const observerRef2 = useRef<HTMLDivElement | null>(null);
  const [sentinel2, setSentinel2] = useState<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const params = useSearchParams();
  const page = params.get("page") || "1";
  const limit = params.get("limit") || "20";

  const { chatId } = useParams();
  const { socket } = useSocket();

  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  // Single conversation details
  const {
    data: singleChat,
    isLoading: isLoadingSingleChat,
    refetch: refetchSingleChat,
  } = useQuery({
    queryKey: ["single-conversation", chatId],
    queryFn: () => inbox?.getSingleConversation(chatId as string),
    enabled: Boolean(chatId),
  });

  // All conversations (inbox)
  const {
    data: allMessages,
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage,
    isLoading: isLoadingMessages,
  } = useInfiniteQuery({
    queryKey: ["chats", page, limit],
    queryFn: () =>
      inbox.getConversations({ page: Number(page), limit: Number(limit) }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data;
      const currentPage = Number(meta.currentPage);
      const totalPages = meta.lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const flattenedMessages = useMemo(() => {
    const fetched =
      allMessages?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
    // Sort conversations by updatedAt/createdAt (desc)
    return fetched.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [allMessages]);

  // Single chat messages
  const {
    data: allChatMessages,
    fetchNextPage: fetchNextChatMessagesPage,
    hasNextPage: hasNextChatMessagesPage,
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
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Combine fetched + live messages
  const flattenedChatMessages = useMemo(() => {
    const fetched =
      allChatMessages?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];
    const combined = [...fetched, ...liveMessages];
    return combined.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [allChatMessages, liveMessages]);

  // Observer for conversation list pagination
  useEffect(() => {
    if (!sentinel || !hasNextMessagesPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextMessagesPage) {
          fetchNextMessagesPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel);
    observerRef.current = sentinel;

    return () => observerRef.current && observer.unobserve(observerRef.current);
  }, [sentinel, hasNextMessagesPage, fetchNextMessagesPage]);

  // Observer for chat message pagination
  useEffect(() => {
    if (!sentinel2 || !hasNextChatMessagesPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextChatMessagesPage) {
          fetchNextChatMessagesPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel2);
    observerRef2.current = sentinel2;

    return () =>
      observerRef2.current && observer.unobserve(observerRef2.current);
  }, [sentinel2, hasNextChatMessagesPage, fetchNextChatMessagesPage]);

  // Socket updates for live messages
  // Reset liveMessages when switching chats
  useEffect(() => {
    setLiveMessages([]);
  }, [chatId]);

  // 1) INBOX: keep conversations ordered via NEW_MESSAGE only
  useEffect(() => {
    if (!socket) return;

    const handleNewMessageForInbox = (data: any) => {
      const payload = data?.payload || data?.data;
      if (!payload?.data) return;

      // build a light message just to read conversation/timestamps
      const newMessage: Message = {
        _id: payload.data._id,
        message: payload.data.message?.message || payload.data.message,
        media: payload.data.media ?? [],
        sender: payload.data.sender,
        senderType: payload.data.senderType,
        conversation: payload.data.conversation,
        createdAt:
          payload?.data?.message?.createdAt ||
          payload?.data?.createdAt ||
          new Date().toISOString(),
        isOwn: payload.data.isOwn,
        readBy: payload.data.readBy,
        entity: payload.data.entity,
        entityType: payload.data.entityType,
        messageType: payload.data.messageType,
        payload: payload.data.payload,
        updatedAt: payload.data.updatedAt,
        __v: payload.data.__v,
      };

      const convId = newMessage.conversation;

      // Only update conversations cache (DO NOT touch liveMessages here)
      queryClient.setQueryData(["chats", page, limit], (prev: any) => {
        if (!prev?.pages?.length) return prev;

        const pages = prev.pages.map((p: any) =>
          p
            ? {
                ...p,
                data: p.data
                  ? { ...p.data, data: [...(p.data.data ?? [])] }
                  : p.data,
              }
            : p
        );

        let found = false;
        let updatedItem: any | null = null;

        for (const p of pages) {
          const arr = p?.data?.data ?? [];
          const idx = arr.findIndex(
            (c: any) => c?._id === convId || c?.id === convId
          );
          if (idx !== -1) {
            found = true;
            const c = arr[idx];
            updatedItem = {
              ...c,
              lastMessage: newMessage.message ?? c?.lastMessage,
              updatedAt: newMessage.createdAt,
              unreadCount: (c?.unreadCount ?? 0) + (newMessage.isOwn ? 0 : 1),
            };
            arr.splice(idx, 1);
            break;
          }
        }

        if (!pages[0]?.data) pages[0] = { ...pages[0], data: { data: [] } };
        if (!pages[0].data.data) pages[0].data.data = [];

        if (!found) {
          updatedItem = {
            _id: convId,
            lastMessage: newMessage.message,
            updatedAt: newMessage.createdAt,
            unreadCount: newMessage.isOwn ? 0 : 1,
          };
        }

        pages[0].data.data = [updatedItem!, ...pages[0].data.data].sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );

        return { ...prev, pages };
      });
    };

    socket.on("NEW_MESSAGE", handleNewMessageForInbox);

    return () => {
      socket.off("NEW_MESSAGE", handleNewMessageForInbox);
    };
  }, [socket, queryClient, page, limit]);

  // 2) SINGLE CHAT: maintain live thread via Conversation only
  useEffect(() => {
    if (!socket) return;

    const handleConversationForThread = (data: any) => {
      const payload = data?.payload || data?.data;
      const msg = payload?.data;
      if (!msg) return;

      // Only keep messages for the active chatId
      const convId = msg.conversation;
      if (!chatId || convId !== chatId) return;

      const newMessage: Message = {
        _id: msg._id,
        message: msg.message?.message || msg.message,
        media: msg.media ?? [],
        sender: msg.sender,
        senderType: msg.senderType,
        conversation: convId,
        createdAt:
          msg?.message?.createdAt || msg?.createdAt || new Date().toISOString(),
        isOwn: msg.isOwn,
        readBy: msg.readBy,
        entity: msg.entity,
        entityType: msg.entityType,
        messageType: msg.messageType,
        payload: msg.payload,
        updatedAt: msg.updatedAt,
        __v: msg.__v,
      };

      // Append with dedupe (in case of rapid replays)
      setLiveMessages((prev) => {
        const exists = prev.some((m) => m._id === newMessage._id);
        const next = exists ? prev : [...prev, newMessage];
        // keep oldest -> newest for your current UI
        return next.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    };

    socket.on("Conversation", handleConversationForThread);

    return () => {
      socket.off("Conversation", handleConversationForThread);
    };
  }, [socket, chatId]);

  const handleSendMessage = async () => {
    try {
      const message = {};
    } catch (error: any) {
      console.error("Chat error", error);
    }
  };

  return {
    // Conversations (inbox)
    allMessages,
    flattenedMessages,
    fetchNextMessagesPage,
    hasNextMessagesPage,
    isFetchingNextMessagesPage,
    isLoadingMessages,
    sentinelRef: setSentinel,

    // Single conversation chat
    singleChat,
    isLoadingSingleChat,
    flattenedChatMessages,
    fetchNextChatMessagesPage,
    hasNextChatMessagesPage,
    sentinelRef2: setSentinel2,
  };
};
