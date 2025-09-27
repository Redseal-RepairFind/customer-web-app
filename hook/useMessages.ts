"use client";

import { inbox } from "@/lib/api/actions/dashboard-actions/inbox-calls/inbox";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Message, OutgoingPayload } from "@/utils/types";
import { useSocket } from "@/contexts/socket-contexts";
import { nanoid } from "nanoid";

/**
 * NOTES (read-only):
 * - Fixed useInfiniteQuery usage to rely on pageParam (bug before prevented pagination).
 * - Made query keys stable and specific to chatId & limit.
 * - Hardened socket handlers, optimistic updates, and cache writes.
 * - Added robust sorting, defensive null checks, and dedupe.
 * - IntersectionObservers now unobserve/cleanup correctly; thresholds adjusted for reliability.
 */

type PaginatedResult<T> = {
  data: {
    data: T[];
    currentPage: number;
    lastPage: number;
  };
};

type Conversation = {
  _id: string;
  id?: string;
  lastMessage?: string;
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
  // ...any other fields your API returns
};

const dateToMs = (d?: string) => (d ? new Date(d).getTime() : 0);

export const useMessages = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { chatId: _chatId } = useParams<{ chatId?: string }>();
  const chatId =
    typeof _chatId === "string"
      ? _chatId
      : Array.isArray(_chatId)
      ? _chatId[0]
      : undefined;

  const limitParam = searchParams.get("limit");
  const limit =
    Number.isFinite(Number(limitParam)) && Number(limitParam) > 0
      ? Number(limitParam)
      : 20;

  const { socket } = useSocket();

  const [isSending, setIsSending] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerRef2 = useRef<IntersectionObserver | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const [sentinel2, setSentinel2] = useState<HTMLDivElement | null>(null);

  // Reset live thread when switching chats
  useEffect(() => {
    setLiveMessages([]);
  }, [chatId]);

  // ===== Single conversation details =====
  const {
    data: singleChat,
    isLoading: isLoadingSingleChat,
    refetch: refetchSingleChat,
  } = useQuery({
    queryKey: ["single-conversation", chatId],
    queryFn: async () => {
      if (!chatId) return null;
      return inbox.getSingleConversation(chatId);
    },
    enabled: Boolean(chatId),
  });

  // ===== INBOX LIST (Conversations) with proper infinite pagination =====
  const {
    data: conversationsPages,
    fetchNextPage: fetchNextConversationsPage,
    hasNextPage: hasNextConversationsPage,
    isFetchingNextPage: isFetchingNextConversationsPage,
    isLoading: isLoadingConversations,
  } = useInfiniteQuery<PaginatedResult<Conversation>>({
    queryKey: ["chats", { limit }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      inbox.getConversations({ page: Number(pageParam), limit }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data;
      if (!meta) return undefined;
      const currentPage = Number(meta.currentPage ?? 1);
      const totalPages = Number(meta.lastPage ?? 1);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const flattenedMessages = useMemo<Conversation[]>(() => {
    const fetched =
      conversationsPages?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
    const dedup = new Map<string, Conversation>();
    for (const c of fetched) {
      const key = c._id ?? c.id!;
      // keep the freshest version of the conversation
      const prev = dedup.get(key);
      if (!prev) dedup.set(key, c);
      else {
        const newer =
          dateToMs(c.updatedAt || c.createdAt) >
          dateToMs(prev.updatedAt || prev.createdAt)
            ? c
            : prev;
        dedup.set(key, newer);
      }
    }
    return [...dedup.values()].sort(
      (a, b) =>
        dateToMs(b.updatedAt || b.createdAt) -
        dateToMs(a.updatedAt || a.createdAt)
    );
  }, [conversationsPages]);

  // ===== SINGLE CHAT MESSAGES with proper infinite pagination =====
  const {
    data: chatPages,
    fetchNextPage: fetchNextChatMessagesPage,
    hasNextPage: hasNextChatMessagesPage,
    isFetchingNextPage: isFetchingNextChatMessagesPage,
    isLoading: isLoadingChatMessages,
  } = useInfiniteQuery<PaginatedResult<Message>>({
    queryKey: ["chat-messages", { chatId, limit }],
    initialPageParam: 1,
    enabled: Boolean(chatId),
    queryFn: async ({ pageParam }) => {
      if (!chatId) {
        return {
          data: { data: [], currentPage: 1, lastPage: 1 },
        } as PaginatedResult<Message>;
      }
      return inbox.getSingleConversationMessages({
        id: chatId,
        page: Number(pageParam),
        limit,
      });
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data;
      if (!meta) return undefined;
      const currentPage = Number(meta.currentPage ?? 1);
      const totalPages = Number(meta.lastPage ?? 1);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const flattenedChatMessages = useMemo<Message[]>(() => {
    const fetched = chatPages?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
    // merge fetched + live with dedupe (by _id)
    const byId = new Map<string, Message>();
    for (const m of [...fetched, ...liveMessages]) {
      if (!m?._id) continue;
      const prev = byId.get(m._id);
      if (!prev) byId.set(m._id, m);
      else {
        // prefer the one with concrete server id/fields (usually both same id; keep latest by createdAt)
        const newer =
          dateToMs(m.createdAt) >= dateToMs(prev.createdAt) ? m : prev;
        byId.set(m._id, newer);
      }
    }
    return [...byId.values()].sort(
      (a, b) => dateToMs(a.createdAt) - dateToMs(b.createdAt)
    );
  }, [chatPages, liveMessages]);

  // ===== Observers (INBOX) =====
  useEffect(() => {
    if (!sentinel) return;
    if (observerRef.current) observerRef.current.disconnect();

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextConversationsPage) {
          fetchNextConversationsPage();
        }
      },
      { threshold: 0.25 } // less strict than 1.0 for reliability
    );
    obs.observe(sentinel);
    observerRef.current = obs;

    return () => {
      obs.disconnect();
      observerRef.current = null;
    };
  }, [sentinel, hasNextConversationsPage, fetchNextConversationsPage]);

  // ===== Observers (SINGLE CHAT) =====
  useEffect(() => {
    if (!sentinel2) return;
    if (observerRef2.current) observerRef2.current.disconnect();

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextChatMessagesPage) {
          fetchNextChatMessagesPage();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(sentinel2);
    observerRef2.current = obs;

    return () => {
      obs.disconnect();
      observerRef2.current = null;
    };
  }, [sentinel2, hasNextChatMessagesPage, fetchNextChatMessagesPage]);

  // ===== SOCKET: push new messages into INBOX ordering (NEW_MESSAGE event) =====
  useEffect(() => {
    if (!socket) return;

    const handleNewMessageForInbox = (data: any) => {
      const payload = data?.payload || data?.data;
      const p = payload?.data;
      if (!p) return;

      const newMsg: Message = {
        _id: p._id,
        message: p.message?.message ?? p.message,
        media: p.media ?? [],
        sender: p.sender,
        senderType: p.senderType,
        conversation: p.conversation,
        createdAt:
          p?.message?.createdAt || p?.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt,
        isOwn: Boolean(p.isOwn),
        readBy: p.readBy ?? [],
        entity: p.entity,
        entityType: p.entityType,
        messageType: p.messageType,
        payload: p.payload,
        __v: p.__v,
      };

      const convId = newMsg.conversation;
      if (!convId) return;

      queryClient.setQueryData(["chats", { limit }], (prev: any): any => {
        const prevPages: any[] = prev?.pages ? [...prev.pages] : [];
        if (!prevPages.length) return prev;

        // clone shallowly to avoid mutating cache references
        const pages = prevPages.map((pg) =>
          pg?.data
            ? { ...pg, data: { ...pg.data, data: [...(pg.data.data ?? [])] } }
            : pg
        );

        let found: Conversation | null = null;
        let foundIdx = -1;
        let foundPage: any | null = null;

        for (const pg of pages) {
          const arr: Conversation[] = pg?.data?.data ?? [];
          const idx = arr.findIndex((c) => (c._id || c.id) === convId);
          if (idx !== -1) {
            found = arr[idx];
            foundIdx = idx;
            foundPage = pg;
            break;
          }
        }

        // Build/update the conversation item
        const updated: Conversation = {
          ...(found ?? { _id: convId }),
          lastMessage:
            newMsg.message ??
            (newMsg.media?.length
              ? `Sent ${newMsg.media.length} media`
              : found?.lastMessage),
          updatedAt: newMsg.createdAt,
          unreadCount:
            // increment if message is not our own
            (found?.unreadCount ?? 0) + (newMsg.isOwn ? 0 : 1),
        };

        // Remove old position if found
        if (foundPage && foundIdx > -1) {
          const list = foundPage.data.data as Conversation[];
          list.splice(foundIdx, 1);
        }

        // Ensure first page exists
        if (!pages[0]) pages[0] = { data: { data: [] } };
        if (!pages[0].data) pages[0].data = { data: [] };
        if (!pages[0].data.data) pages[0].data.data = [];

        // Insert at top and re-sort
        const firstList = pages[0].data.data as Conversation[];
        const existingIdx = firstList.findIndex(
          (c) => (c._id || c.id) === convId
        );
        if (existingIdx !== -1) firstList.splice(existingIdx, 1);
        firstList.unshift(updated);

        // resort first page (others are paginated historical pages)
        pages[0].data.data = firstList.sort(
          (a, b) =>
            dateToMs(b.updatedAt || b.createdAt) -
            dateToMs(a.updatedAt || a.createdAt)
        );

        return { ...prev, pages };
      });
    };

    socket.on("NEW_MESSAGE", handleNewMessageForInbox);
    return () => {
      socket.off("NEW_MESSAGE", handleNewMessageForInbox);
    };
  }, [socket, queryClient, limit]);

  // ===== SOCKET: push live messages into ACTIVE THREAD only (Conversation event) =====
  useEffect(() => {
    if (!socket) return;

    const handleConversationForThread = (data: any) => {
      const payload = data?.payload || data?.data;
      const msg = payload?.data;
      if (!msg) return;

      const convId = msg.conversation;
      if (!chatId || convId !== chatId) return;

      const newMsg: Message = {
        _id: msg._id,
        message: msg.message?.message ?? msg.message,
        media: msg.media ?? [],
        sender: msg.sender,
        senderType: msg.senderType,
        conversation: convId,
        createdAt:
          msg?.message?.createdAt || msg?.createdAt || new Date().toISOString(),
        updatedAt: msg.updatedAt,
        isOwn: Boolean(msg.isOwn),
        readBy: msg.readBy ?? [],
        entity: msg.entity,
        entityType: msg.entityType,
        messageType: msg.messageType,
        payload: msg.payload,
        __v: msg.__v,
      };

      setLiveMessages((prev) => {
        const exists = prev.some((m) => m._id === newMsg._id);
        const next = exists ? prev : [...prev, newMsg];
        return next.sort(
          (a, b) => dateToMs(a.createdAt) - dateToMs(b.createdAt)
        );
      });
    };

    socket.on("Conversation", handleConversationForThread);
    return () => {
      socket.off("Conversation", handleConversationForThread);
    };
  }, [socket, chatId]);

  // ===== SEND MESSAGE (optimistic) =====
  const handleSendMessage = async (payload: OutgoingPayload) => {
    const conversationId = payload.id;
    const body = payload.message;

    if (body.type === "TEXT" && !body.message?.trim()) return;

    setIsSending(true);
    const tempId = `temp-${nanoid()}`;
    const nowIso = new Date().toISOString();

    const optimistic: Message = {
      _id: tempId,
      message: body.type === "TEXT" ? body.message : undefined,
      media: body.type === "MEDIA" ? body.media ?? [] : [],
      sender: "me",
      senderType: "customers",
      conversation: conversationId,
      createdAt: nowIso,
      updatedAt: nowIso,
      isOwn: true,
      readBy: [],
      entity: undefined,
      entityType: undefined,
      messageType: body.type,
      payload: { eventType: "Conversation" },
      __v: 0,
    };

    if (chatId === conversationId) {
      setLiveMessages((prev) =>
        [...prev, optimistic].sort(
          (a, b) => dateToMs(a.createdAt) - dateToMs(b.createdAt)
        )
      );
    }

    // bump conversation in inbox immediately
    queryClient.setQueryData(["chats", { limit }], (prev: any) => {
      const prevPages: any[] = prev?.pages ? [...prev.pages] : [];
      if (!prevPages.length) return prev;

      const pages = prevPages.map((pg) =>
        pg?.data
          ? { ...pg, data: { ...pg.data, data: [...(pg.data.data ?? [])] } }
          : pg
      );

      let found: Conversation | null = null;
      let foundIdx = -1;
      let foundPage: any | null = null;

      for (const pg of pages) {
        const arr: Conversation[] = pg?.data?.data ?? [];
        const idx = arr.findIndex((c) => (c._id || c.id) === conversationId);
        if (idx !== -1) {
          found = arr[idx];
          foundIdx = idx;
          foundPage = pg;
          break;
        }
      }

      const lastMessage =
        body.type === "TEXT"
          ? body.message
          : `Sent ${body.media?.length ?? 0} media`;

      const updated: Conversation = {
        ...(found ?? { _id: conversationId }),
        lastMessage,
        updatedAt: nowIso,
        unreadCount: found?.unreadCount ?? 0,
      };

      if (foundPage && foundIdx > -1) {
        (foundPage.data.data as Conversation[]).splice(foundIdx, 1);
      }

      if (!pages[0]) pages[0] = { data: { data: [] } };
      if (!pages[0].data) pages[0].data = { data: [] };
      if (!pages[0].data.data) pages[0].data.data = [];

      const firstList = pages[0].data.data as Conversation[];
      const existingIdx = firstList.findIndex(
        (c) => (c._id || c.id) === conversationId
      );
      if (existingIdx !== -1) firstList.splice(existingIdx, 1);
      firstList.unshift(updated);

      pages[0].data.data = firstList.sort(
        (a, b) =>
          dateToMs(b.updatedAt || b.createdAt) -
          dateToMs(a.updatedAt || a.createdAt)
      );

      return { ...prev, pages };
    });

    try {
      const res = await inbox.sendMessages({
        id: conversationId,
        message: body,
      });
      const d = res?.data ?? res;

      const serverMsg: Message = {
        _id: d._id,
        message: d.message?.message ?? d.message,
        media: d.media ?? [],
        sender: d.sender,
        senderType: d.senderType,
        conversation: d.conversation ?? conversationId,
        createdAt: d.createdAt || nowIso,
        updatedAt: d.updatedAt || d.createdAt || nowIso,
        isOwn: true,
        readBy: d.readBy ?? [],
        entity: d.entity,
        entityType: d.entityType,
        messageType: d.messageType ?? body.type,
        payload: d.payload,
        __v: d.__v,
      };

      if (chatId === conversationId) {
        setLiveMessages((prev) => {
          const replaced = prev.map((m) => (m._id === tempId ? serverMsg : m));
          return replaced.sort(
            (a, b) => dateToMs(a.createdAt) - dateToMs(b.createdAt)
          );
        });
      }

      // also patch the first page of cached chat messages (optional)
      queryClient.setQueryData(
        ["chat-messages", { chatId, limit }],
        (prev: any) => {
          if (!prev?.pages?.length) return prev;
          const pages = [...prev.pages];
          const first = pages[0];
          if (!first?.data?.data) return prev;
          const list: Message[] = first.data.data;
          if (!list.some((m) => m._id === serverMsg._id)) {
            first.data.data = [...list, serverMsg];
          }
          return { ...prev, pages };
        }
      );

      return serverMsg;
    } catch (err) {
      if (chatId === conversationId) {
        setLiveMessages((prev) => prev.filter((m) => m._id !== tempId));
      }
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return {
    // Conversations (Inbox)
    allMessages: conversationsPages,
    flattenedMessages,
    fetchNextMessagesPage: fetchNextConversationsPage,
    hasNextMessagesPage: hasNextConversationsPage,
    isFetchingNextMessagesPage: isFetchingNextConversationsPage,
    isLoadingMessages: isLoadingConversations,
    sentinelRef: setSentinel,

    // Single conversation
    singleChat,
    isLoadingSingleChat,
    refetchSingleChat,

    // Chat thread
    allChatMessages: chatPages,
    flattenedChatMessages,
    fetchNextChatMessagesPage,
    hasNextChatMessagesPage,
    isFetchingNextChatMessagesPage,
    isLoadingChatMessages,
    sentinelRef2: setSentinel2,

    // Send state + action
    isSending,
    handleSendMessage,
  };
};
