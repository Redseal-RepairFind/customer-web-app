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
import { useUser } from "./useMe";
import { deleteFromS3, getSignUrls } from "@/lib/aws/aws-action";
import axios from "axios";
/**
 * Key fixes:
 * 1) Normalize IDs coming from sockets (conversation may be string or object).
 * 2) Normalize createdAt values; keep ascending sort by createdAt for thread.
 * 3) Hardened inbox bump to use normalized conversation id.
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
  createdAt?: string | number;
  updatedAt?: string | number;
  unreadCount?: number;
};

const toMs = (d?: string | number) => (d ? new Date(d).getTime() : 0);
const safeStr = (v: unknown) => (typeof v === "string" ? v : undefined);

/** Extract a stable id from string | {_id}|{id} | any */
const getId = (v: any): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object") return safeStr(v._id) ?? safeStr(v.id);
  return undefined;
};

// Safe getter across multiple candidate paths
const pick = (obj: any, paths: string[]) => {
  for (const p of paths) {
    const val = p
      .split(".")
      .reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
    if (val != null) return val;
  }
  return undefined;
};

// Strict string id
const asId = (v: unknown) =>
  typeof v === "string" && v.trim() ? v : undefined;
/** ---------- POLICIES ---------- */
export const MEDIA_LIMITS = {
  maxFiles: 10,
  maxBytes: 20 * 1024 * 1024, // 20MB per file
  accept: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "video/mp4",
    "video/quicktime", // .mov
    "video/webm",
  ],
} as const;

export const FILE_LIMITS = {
  maxFiles: 10,
  maxBytes: 25 * 1024 * 1024, // 25MB per file
  accept: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    // (Optional archives; remove if not allowed)
    "application/zip",
    "application/x-zip-compressed",
    "application/x-7z-compressed",
    "application/x-rar-compressed",
    "application/x-tar",
  ],
} as const;

type Policy = {
  maxFiles: number;
  maxBytes: number;
  accept: readonly string[];
};

/** ---------- TYPE HELPERS ---------- */
export const isVideo = (t?: string) => (t ?? "").startsWith("video/");
export const isImage = (t?: string) =>
  (t ?? "").startsWith("image/") || (t ?? "").includes("heic");

export const isDocument = (t?: any) =>
  !!t && !isImage(t) && !isVideo(t) && FILE_LIMITS.accept.includes(t);

export const fileBucket = (
  mime?: string
):
  | "image"
  | "video"
  | "pdf"
  | "excel"
  | "word"
  | "ppt"
  | "text"
  | "json"
  | "csv"
  | "archive"
  | "other" => {
  const t = mime ?? "";
  if (isImage(t)) return "image";
  if (isVideo(t)) return "video";
  if (t === "application/pdf") return "pdf";
  if (t.includes("spreadsheet") || t.includes("excel")) return "excel";
  if (t.includes("wordprocessingml") || t.includes("msword")) return "word";
  if (t.includes("presentation")) return "ppt";
  if (t === "text/plain") return "text";
  if (t === "application/json") return "json";
  if (t === "text/csv") return "csv";
  if (
    t.includes("zip") ||
    t.includes("rar") ||
    t.includes("7z") ||
    t.includes("tar")
  )
    return "archive";
  return "other";
};

/** ---------- META (media only) ---------- */
const getMediaMeta = (file: File) =>
  new Promise<{ width?: number; height?: number; duration?: number }>(
    (resolve) => {
      try {
        if (isVideo(file.type)) {
          const video = document.createElement("video");
          video.preload = "metadata";
          video.onloadedmetadata = () => {
            const duration =
              isFinite(video.duration) && video.duration > 0
                ? Number(video.duration)
                : undefined;
            resolve({ duration });
            URL.revokeObjectURL(video.src);
          };
          video.onerror = () => resolve({});
          video.src = URL.createObjectURL(file);
          return;
        }
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({});
        img.src = URL.createObjectURL(file);
      } catch {
        resolve({});
      }
    }
  );

/** (Optional) HEIC → JPEG hook (no-op here) */
const maybeConvertHeic = async (file: File): Promise<File> => {
  if (!/heic|heif/i.test(file.type)) return file;
  return file;
};

/** ---------- GENERIC VALIDATOR (media or docs) ---------- */
const dedupe = (files: File[]) => {
  const map = new Map<string, File>();
  for (const f of files) {
    const key = `${f.name}-${f.size}-${f.type}`;
    if (!map.has(key)) map.set(key, f);
  }
  return [...map.values()];
};

export const validateFilesByPolicy = (files: File[], policy: Policy) => {
  const deduped = dedupe(files).slice(0, policy.maxFiles);
  const valid: File[] = [];
  const errors: string[] = [];

  for (const f of deduped) {
    if (!policy.accept.includes(f.type)) {
      errors.push(`${f.name}: unsupported type ${f.type || "(unknown)"}`);
      continue;
    }
    if (f.size > policy.maxBytes) {
      const mb = Math.floor(policy.maxBytes / (1024 * 1024));
      errors.push(`${f.name}: exceeds ${mb}MB limit`);
      continue;
    }
    valid.push(f);
  }
  return { valid, errors };
};

/** Choose policy automatically (all images/videos => MEDIA; otherwise FILES) */
export const pickPolicyFor = (files: File[]): Policy => {
  const allMedia = files.every((f) => isImage(f.type) || isVideo(f.type));
  return allMedia ? MEDIA_LIMITS : FILE_LIMITS;
};

/** Back-compat wrapper (kept your old name/signature) */
export const validateFiles = (files: File[]) => {
  const policy = pickPolicyFor(files);
  return validateFilesByPolicy(files, policy);
};

/** ---------- BUILD FINAL PAYLOAD ENTRIES ---------- */
/** For media: add width/height/duration & optimistic preview URL */
export const buildMediaDraftEntries = async (files: File[]) => {
  const converted = await Promise.all(files.map(maybeConvertHeic));
  const metas = await Promise.all(converted.map(getMediaMeta));
  return converted.map((f, i) => ({
    name: f.name,
    type: f.type,
    size: f.size,
    width: metas[i].width,
    height: metas[i].height,
    duration: metas[i].duration,
    url: URL.createObjectURL(f), // optimistic preview; replace after upload
  }));
};

/** For documents: basic fields + optimistic "blob:" link to allow quick open */
export const buildFileDraftEntries = (files: File[]) =>
  files.map((f) => ({
    name: f.name,
    type: f.type || "application/octet-stream",
    size: f.size,
    url: URL.createObjectURL(f), // replace with CDN URL after upload
  }));

export const useMessages = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { chatId: _chatId } = useParams<{ chatId?: string }>();

  const { curUser } = useUser?.() ?? {};
  const [medias, setMedias] = useState<{ url: string }[]>();
  const user = curUser?.data;
  const currentUserId: string | undefined =
    (user?._id as string) || (user?.id as string) || undefined;

  console.log(medias);
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

  // ===== INBOX LIST =====
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
      const key = c._id ?? (c.id as string);
      if (!key) continue;
      const prev = dedup.get(key);
      if (!prev) dedup.set(key, c);
      else {
        const newer =
          toMs(c.updatedAt || c.createdAt) >
          toMs(prev.updatedAt || prev.createdAt)
            ? c
            : prev;
        dedup.set(key, newer);
      }
    }
    return [...dedup.values()].sort(
      (a, b) =>
        toMs(b.updatedAt || b.createdAt) - toMs(a.updatedAt || a.createdAt)
    );
  }, [conversationsPages]);

  // ===== SINGLE CHAT MESSAGES =====
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

    const byId = new Map<string, Message>();
    for (const m of [...fetched, ...liveMessages]) {
      const id = m?._id ?? getId((m as any)?.id) ?? nanoid();
      const normalized: Message = { ...m, _id: id };
      const prev = byId.get(id);
      if (!prev) byId.set(id, normalized);
      else {
        const newer =
          toMs(normalized.createdAt as any) >= toMs(prev.createdAt as any)
            ? normalized
            : prev;
        byId.set(id, newer);
      }
    }
    return [...byId.values()].sort(
      (a, b) => toMs(a.createdAt as any) - toMs(b.createdAt as any)
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
      { threshold: 0.25 }
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

  const bodiesEqual = (a?: any, b?: any) => {
    // Compare text & media length for quick reconciliation
    const am = Array.isArray(a?.media) ? a.media.length : 0;
    const bm = Array.isArray(b?.media) ? b.media.length : 0;
    return (
      (a?.message ?? "") === (b?.message ?? "") &&
      am === bm &&
      (a?.messageType ?? b?.messageType)
    );
  };

  // EXACTLY matches the payload you showed, with isOwn computed by sender === currentUserId
  const normalizeMsgFromEvent = (
    evt: any,
    currentUserId?: string
  ): Message | null => {
    const msg =
      pick(evt, ["payload.data.message"]) ??
      pick(evt, ["payload.message"]) ??
      pick(evt, ["payload.data.data.message"]);

    if (!msg) return null;

    const id =
      asId(msg._id) ??
      asId(pick(evt, ["payload.data._id"])) ??
      asId(pick(evt, ["payload._id"])) ??
      undefined;

    const conv = asId(msg.conversation);
    if (!conv) return null;

    const created =
      msg.createdAt ??
      pick(evt, ["payload.data.createdAt"]) ??
      new Date().toISOString();

    // 👇 CRITICAL: compute isOwn from sender
    const computedIsOwn =
      !!currentUserId && typeof msg.sender === "string"
        ? msg.sender === currentUserId
        : Boolean(msg.isOwn);

    return {
      _id: id ?? `evt-${nanoid()}`,
      message: msg.message ?? "",
      media: Array.isArray(msg.media) ? msg.media : [],
      sender: msg.sender,
      senderType: msg.senderType,
      conversation: conv,
      createdAt: created,
      updatedAt: msg.updatedAt ?? created,
      isOwn: computedIsOwn,
      readBy: Array.isArray(msg.readBy) ? msg.readBy : [],
      entity: pick(evt, ["payload.data.entity"]),
      entityType: pick(evt, ["payload.data.entityType"]),
      messageType: msg.messageType,
      payload: evt.payload,
      __v: msg.__v,
    } as Message;
  };

  useEffect(() => {
    if (!socket) return;

    const onInboxEvent = (data: any) => {
      const n = normalizeMsgFromEvent(data);
      if (!n) return;

      const convId = n.conversation;

      queryClient.setQueryData(["chats", { limit }], (prev: any): any => {
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
          const idx = arr.findIndex((c) => (c._id || c.id) === convId);
          if (idx !== -1) {
            found = arr[idx];
            foundIdx = idx;
            foundPage = pg;
            break;
          }
        }

        const updated: Conversation = {
          ...(found ?? { _id: convId }),
          lastMessage:
            n.message ??
            (n.media?.length
              ? `Sent ${n.media.length} media`
              : found?.lastMessage),
          updatedAt: n.createdAt,
          unreadCount: (found?.unreadCount ?? 0) + (n.isOwn ? 0 : 1),
        };

        if (foundPage && foundIdx > -1) {
          (foundPage.data.data as Conversation[]).splice(foundIdx, 1);
        }

        // ensure first page and unshift at top
        if (!pages[0]) pages[0] = { data: { data: [] } };
        if (!pages[0].data) pages[0].data = { data: [] };
        if (!pages[0].data.data) pages[0].data.data = [];

        const firstList = pages[0].data.data as Conversation[];
        const existingIdx = firstList.findIndex(
          (c) => (c._id || c.id) === convId
        );
        if (existingIdx !== -1) firstList.splice(existingIdx, 1);
        firstList.unshift(updated);

        pages[0].data.data = firstList.sort(
          (a, b) =>
            toMs(b.updatedAt || b.createdAt) - toMs(a.updatedAt || a.createdAt)
        );

        return { ...prev, pages };
      });
    };

    socket.on("NEW_MESSAGE", onInboxEvent);
    socket.on("Conversation", onInboxEvent); // some servers only emit this

    return () => {
      socket.off("NEW_MESSAGE", onInboxEvent);
      socket.off("Conversation", onInboxEvent);
    };
  }, [socket, queryClient, limit]);

  useEffect(() => {
    if (!socket) return;

    const onEvent = (data: any) => {
      const n = normalizeMsgFromEvent(data, currentUserId);
      if (!n) return;
      if (!chatId || n.conversation !== chatId) return;

      setLiveMessages((prev) => {
        // 1) If we already have this id, merge (prefer isOwn=true & newer timestamps)
        const idxById = prev.findIndex((m) => m._id === n._id);
        if (idxById !== -1) {
          const merged: Message = {
            ...prev[idxById],
            ...n,
            isOwn: prev[idxById].isOwn || n.isOwn, // never flip true → false
          };
          const next = [...prev];
          next[idxById] = merged;
          next.sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
          return next;
        }

        // 2) Reconcile against an optimistic temp for *my* own message
        if (n.isOwn) {
          const nowMs = toMs(n.createdAt);
          const tempIdx = prev.findIndex((m) => {
            if (!m._id?.startsWith("temp-")) return false;
            if (!m.isOwn) return false;
            if (m.conversation !== n.conversation) return false;
            if (!bodiesEqual(m, n)) return false;
            // within 5s window
            return Math.abs(toMs(m.createdAt) - nowMs) <= 5000;
          });

          if (tempIdx !== -1) {
            const next = [...prev];
            const preserved = next[tempIdx];
            // replace the temp with the server event, but keep isOwn true
            next[tempIdx] = { ...n, isOwn: true };
            next.sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
            return next;
          }
        }

        // 3) Otherwise just insert
        const next = [...prev, n];
        next.sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
        return next;
      });
    };

    socket.on("Conversation", onEvent);
    socket.on("NEW_MESSAGE", onEvent);

    return () => {
      socket.off("Conversation", onEvent);
      socket.off("NEW_MESSAGE", onEvent);
    };
  }, [socket, chatId, currentUserId]);

  // ===== SEND MESSAGE (optimistic) =====
  const handleSendMessage = async (payload: OutgoingPayload) => {
    const conversationId = payload.id;
    const body = payload.message;

    const isOnlyWhitespaceText =
      body.type === "TEXT" && !body.message?.trim() && !body.media?.length;
    if (isOnlyWhitespaceText) return;

    setIsSending(true);
    const tempId = `temp-${nanoid()}`;
    const nowIso = new Date().toISOString();

    let finalMediaPayload:
      | {
          url: string;
          type?: string;
          size?: number;
          width?: number;
          height?: number;
          duration?: number;
          thumbnailUrl?: string;
        }[]
      | undefined;

    let optimisticMedia:
      | {
          url: string;
          type?: string;
          size?: number;
          width?: number;
          height?: number;
          duration?: number;
        }
      | any[] = [];

    // ---------------- MEDIA PREP + UPLOAD ----------------
    if (body?.type === "MEDIA") {
      const rawFiles = Array.isArray(body.media) ? body.media : [];

      // 1) Validate
      const { valid, errors } = validateFiles(rawFiles);
      if (errors.length) {
        console.warn("Some files were skipped:", errors);
      }
      if (!valid.length && !body.message?.trim()) {
        setIsSending(false);
        return;
      }

      // 2) Optional HEIC convert
      const toUpload: File[] = [];
      for (const f of valid) {
        toUpload.push(await maybeConvertHeic(f));
      }

      // 3) Gather metadata + optimistic previews
      const metaList = await Promise.all(toUpload.map(getMediaMeta));
      const previews = toUpload.map((f, i) => ({
        url: URL.createObjectURL(f), // optimistic preview
        type: f.type,
        size: f.size,
        width: metaList[i].width,
        height: metaList[i].height,
        duration: metaList[i].duration,
      }));
      optimisticMedia = previews;

      // 4) Ask server for presigned PUT urls
      const presignReq = toUpload.map((f) => ({
        filename: f.name,
        fileType: f.type,
      }));
      const media = await getSignUrls(presignReq);
      const presigned = media?.urls ?? [];

      // 5) PUT uploads (parallel), allow abort if you want to wire a Cancel button
      await Promise.all(
        toUpload.map((file, i) =>
          axios.put(presigned[i].url, file, {
            headers: { "Content-Type": file.type },
            // onUploadProgress: (e) => console.log(file.name, e.progress)
          })
        )
      );

      // 6) Build final payload (CDN/public URLs)
      finalMediaPayload = presigned.map((p, i) => ({
        url: p.publicUrl,
        type: toUpload[i].type,
        size: toUpload[i].size,
        width: metaList[i].width,
        height: metaList[i].height,
        duration: metaList[i].duration,
        // thumbnailUrl: p.thumbUrl // (if your backend returns thumbs; else omit)
      }));
    }

    // ---------------- OPTIMISTIC MESSAGE ----------------
    const optimistic: Message = {
      _id: tempId,
      message: body.type === "TEXT" ? body.message : body.message || undefined,
      media: body.type === "MEDIA" ? (optimisticMedia as any[]) : [],
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

    const idealBody: {
      type: "MEDIA" | "TEXT";
      media?: {
        url: string;
        type?: string;
        size?: number;
        width?: number;
        height?: number;
        duration?: number;
        thumbnailUrl?: string;
      }[];
      message?: string;
    } =
      body.type === "MEDIA"
        ? { type: "MEDIA", media: finalMediaPayload, message: body?.message }
        : { type: "TEXT", message: body?.message ?? "" };

    if (chatId === conversationId) {
      setLiveMessages((prev) =>
        [...prev, optimistic].sort(
          (a, b) => toMs(a.createdAt as any) - toMs(b.createdAt as any)
        )
      );
    }

    // inbox bump
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
          : `Sent ${finalMediaPayload?.length ?? 0} media`;

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
          toMs(b.updatedAt || b.createdAt) - toMs(a.updatedAt || a.createdAt)
      );

      return { ...prev, pages };
    });

    // ---------------- SEND TO SERVER ----------------
    try {
      const res = await inbox.sendMessages({
        id: conversationId,
        message: idealBody,
      });
      const d = res?.data ?? res;

      const serverMsg: Message = {
        _id: d._id ?? getId(d.id) ?? tempId,
        message: d.message?.message ?? d.message,
        media: d.media ?? finalMediaPayload ?? [],
        sender: d.sender,
        senderType: d.senderType,
        conversation: getId(d.conversation) ?? conversationId,
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
            (a, b) => toMs(a.createdAt as any) - toMs(b.createdAt as any)
          );
        });
      }

      // patch first page cache (optional)
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

  const handleMarkRead = async (id: string) => {
    try {
      await inbox.readAllMessages({ id });
      console.log("Conversation read successfully");
    } catch (error: any) {
      console.error(error);
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
    chatPages,
    handleMarkRead,
  };
};
