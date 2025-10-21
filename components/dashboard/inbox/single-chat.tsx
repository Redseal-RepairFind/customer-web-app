"use client";

import Text from "@/components/ui/text";
import { SpecialBox } from "../home/job-toast-modal";
import { PlanBadge } from "../home/plan-log";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { isDocument, isImage, isVideo, useMessages } from "@/hook/useMessages";
import LoadingTemplate from "@/components/ui/spinner";
import { Message, singleConversationType } from "@/utils/types";
// import { formatTo12Hour, handleHeicFile } from "@/lib/helpers";
// import { formatTo12Hour } from "@/lib/helpers";
import { format, isToday, isYesterday } from "date-fns";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { FaPaperclip } from "react-icons/fa";
import { formatTo12Hour } from "@/lib/helpers";
import { ClipLoader } from "react-spinners";
import Modal from "@/components/ui/customModal";
import { useSocket } from "@/contexts/socket-contexts";
import CallPortal, { CallState } from "./call-portal";
import { useUser } from "@/hook/useMe";
import { useCall } from "@/contexts/call-provider";

type Props = { id: string };

const SingleChatItem = ({ id }: Props) => {
  const { socket } = useSocket();

  const {
    singleChat,
    isLoadingSingleChat,
    flattenedChatMessages,
    isSending,
    handleSendMessage,
    isFetchingNextChatMessagesPage,
    sentinelRef2,
    chatPages,
    handleMarkRead,
  } = useMessages();

  // console.log(singleChat);

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // for top-pagination restore
  const prevScrollHeightRef = useRef<number>(0);

  // for reliable bottom autoscroll & deduped read receipts
  const lastBottomIdRef = useRef<string | null>(null);
  const lastMarkedRef = useRef<string | null>(null);
  const firstPaintDoneRef = useRef<boolean>(false);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 120; // px
    return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
  };
  const initialScrollPendingRef = useRef<string | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    // double-rAF so layout finishes before we scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior });
      });
    });
  };
  // ========= Top pagination: snapshot before fetch =========
  useEffect(() => {
    if (isFetchingNextChatMessagesPage) {
      prevScrollHeightRef.current = containerRef.current?.scrollHeight ?? 0;
    }
  }, [isFetchingNextChatMessagesPage]);

  // ========= Top pagination: restore after page appended =========
  useEffect(() => {
    if (!isFetchingNextChatMessagesPage) {
      const el = containerRef.current;
      if (!el) return;
      const prev = prevScrollHeightRef.current || 0;
      const next = el.scrollHeight;
      const delta = next - prev;
      el.scrollTop = el.scrollTop + delta; // keep viewport anchored
    }
  }, [chatPages, isFetchingNextChatMessagesPage]);

  // ========= On chat switch: force one-time bottom after first paint =========
  useEffect(() => {
    firstPaintDoneRef.current = false;
    lastBottomIdRef.current = null;
    lastMarkedRef.current = null;
  }, [id]);

  useEffect(() => {
    // when the first batch for this chat arrives, jump to bottom once
    if (
      !firstPaintDoneRef.current &&
      (flattenedChatMessages?.length ?? 0) > 0
    ) {
      firstPaintDoneRef.current = true;
      scrollToBottom("auto");
    }
  }, [flattenedChatMessages?.length]);

  // ========= Autoscroll & Mark-as-read on new bottom message =========
  useEffect(() => {
    const list = flattenedChatMessages ?? [];
    if (list.length === 0 || !socket) return;

    const bottom = list[list.length - 1];
    const bottomChanged = bottom._id !== lastBottomIdRef.current;

    if (bottomChanged) {
      const near = isNearBottom();

      // Auto-scroll if user was near bottom OR it's my outgoing message
      if (near || bottom.isOwn) {
        scrollToBottom(bottom.isOwn ? "smooth" : "auto");
      }

      // Mark as read only for incoming newest msg when visible & near bottom
      if (
        !bottom.isOwn &&
        near &&
        document.visibilityState === "visible" &&
        bottom._id !== lastMarkedRef.current
      ) {
        socket.emit(
          "send_mark_conversation_as_read",
          { conversationId: id, messageId: bottom._id },
          () => handleMarkRead(id) // optional local cache sync
        );
        lastMarkedRef.current = bottom._id;
      }

      lastBottomIdRef.current = bottom._id;
    }
  }, [flattenedChatMessages, id, socket, handleMarkRead]);

  // mark that the next render for this chat should auto-scroll to bottom

  if (isLoadingSingleChat) return <LoadingTemplate />;

  let lastMessageDate: string | null = null;

  // console.log(singleChat);

  return (
    <main className="flex flex-col h-screen no-scrollbar">
      {/* Chat header */}
      <ChatHeader item={singleChat?.data} />

      {/* Messages container */}
      <section
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-2"
      >
        {/* TOP sentinel triggers older-page fetch when scrolled up */}
        <div ref={sentinelRef2} className="h-1 w-full" />

        {flattenedChatMessages?.map((mess: Message, i: number) => {
          const messageDay = formatMessageDay(mess.createdAt);
          const showSeparator = messageDay !== lastMessageDate;
          lastMessageDate = messageDay;

          return (
            <div key={mess._id}>
              {showSeparator && (
                <div className="flex justify-center my-2">
                  <span className="px-4 py-1 rounded-full bg-light-400 text-dark text-sm">
                    {messageDay}
                  </span>
                </div>
              )}
              <ChatItem
                chat={mess}
                isSending={isSending}
                isLast={i === flattenedChatMessages.length - 1}
              />
            </div>
          );
        })}

        {/* Bottom anchor */}
        <div ref={messagesEndRef} />
      </section>

      {/* Chat input */}
      <div className="flex-shrink-0 border-t border-light-100 bg-white p-2">
        <ChatInput
          message={message}
          attachments={attachments}
          setAttachments={setAttachments}
          setMessage={setMessage}
          onSend={async () => {
            await handleSendMessage({
              id,
              message: {
                message,
                media: attachments,
                type: attachments.length > 0 ? "MEDIA" : "TEXT",
              },
            });
            setAttachments([]);
            setMessage("");
          }}
          isSending={isSending}
        />
      </div>
    </main>
  );
};

export default SingleChatItem;

// Helper: returns 'Today', 'Yesterday', or formatted date

export function formatMessageDay(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  // Check if it's the same year
  const sameYear = date.getFullYear() === now.getFullYear();

  // Format: Tuesday 20, Sept or Tuesday 20, Sept 2024
  return sameYear
    ? format(date, "EEEE dd, MMM") // e.g., Tuesday 20, Sept
    : format(date, "EEEE dd, MMM yyyy"); // e.g., Tuesday 20, Sept 2024
}

const ChatHeader = ({ item }: { item: singleConversationType }) => {
  const router = useRouter();

  const { handleStartCall } = useCall();

  const { curUser } = useUser();

  const curUserId = curUser?.data?._id;
  const contractor = item?.members?.find(
    (mem: any) => mem?.member !== curUserId
  );

  console.log(contractor);

  return (
    <div className="flex-cols gap-2 ">
      <SpecialBox minHeight="min-h" className="p-3 flex-row-between">
        <div className="flex items-center gap-2 ">
          <button
            className="cursor-pointer flex items-center gap-2"
            onClick={() => router.back()}
          >
            <FaChevronLeft color="#cdcfd0" />
            <div className="md:h-13 md:w-13 h-8 w-8 rounded-full relative">
              <Image
                src={item?.heading?.image}
                fill
                alt="Contractors image"
                className="rounded-full h-full w-full"
              />
            </div>
          </button>
          <Text.Paragraph className="font-semibold text-base md:text-lg">
            {item?.heading?.name}
          </Text.Paragraph>
          {/* {item?.entity ? (
            <PlanBadge
              planName={item?.entity?.status}
              defaultPadding="px-2 md:px-5"
              className="bg-white py-2"
            />
          ) : null} */}
        </div>

        <div className="flex items-center ">
          <button
            className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative"
            onClick={() =>
              handleStartCall({
                toUser: contractor?.member,
                toUserType: contractor?.memberType,
              })
            }
          >
            <Image
              src={icons.callIcon}
              height={20}
              width={20}
              alt="Call icon"
            />
          </button>
          {/* <button className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
            <Image src={icons.eyeIcon} height={20} width={20} alt="Chat icon" />
          </button> */}
        </div>
      </SpecialBox>
      <div className="flex-rows gap-2">
        <Text.SubParagraph className="text-dark text-sm">
          Job: #{item?.entity?.reference}:
        </Text.SubParagraph>
        <Text.SubParagraph className="text-dark-500">
          {item?.entity?.schedule?.remark}
        </Text.SubParagraph>
      </div>
    </div>
  );
};

type LightboxState = { open: boolean; index: number | null };

const ChatItem = ({
  chat,
  isLast,
  isSending,
}: {
  chat: Message;
  isLast: boolean;
  isSending: boolean;
}) => {
  // console.log(chat);

  const [lightbox, setLightbox] = useState<LightboxState>({
    open: false,
    index: null,
  });

  const items = chat?.media ?? [];
  const count = items.length;
  const idx = typeof lightbox.index === "number" ? lightbox.index : -1;
  const current = idx >= 0 && idx < count ? items[idx] : null;

  const openAt = (i: number) => setLightbox({ open: true, index: i });
  const close = () => setLightbox({ open: false, index: null });

  const next = () =>
    setLightbox((s) => ({
      open: true,
      index: s.index == null ? 0 : (s.index + 1) % count,
    }));
  const prev = () =>
    setLightbox((s) => ({
      open: true,
      index: s.index == null ? 0 : (s.index - 1 + count) % count,
    }));

  useEffect(() => {
    if (!lightbox.open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && count > 1) next();
      else if (e.key === "ArrowLeft" && count > 1) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox.open, count]);

  // console.log(openView, media);

  if (chat?.messageType === "ALERT")
    return (
      <div
        className={`w-full flex items-center justify-end my-3  ${
          chat?.isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <span
          className={` ${
            chat?.isOwn
              ? "text-purple-blue-100 bg-dark-600"
              : "bg-purple-blue-50 text-black"
          } rounded-lg flex items-center gap-1 min-w-40 xl:w-[50%] w-full px-4 py-3 `}
        >
          <div className="relative flex h-4 w-4 min-w-4 items-center justify-center rounded-full border border-red-500">
            {/* halo */}
            <span className="absolute h-3 w-3 rounded-full bg-red-500/60 animate-ping" />
            {/* core */}
            <span className="relative h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          </div>

          <div className="flex-cols gap-2">
            <Text.Paragraph>{chat?.message}</Text.Paragraph>
            <Text.SmallText>
              {formatTo12Hour(new Date(chat?.createdAt))}
            </Text.SmallText>
          </div>
        </span>
      </div>
    );
  return (
    <>
      <Modal isOpen={lightbox.open && !!current} onClose={close}>
        <div className="relative">
          {current && isVideo(current.type) ? (
            <video
              src={current.url}
              className="max-h-[80vh] max-w-[90vw] min-w-44 min-h-44  rounded-lg"
              controls
              playsInline
              autoPlay
            />
          ) : current && isImage(current.type) ? (
            <div
              className="relative"
              style={{ maxWidth: "90vw", maxHeight: "80vh" }}
            >
              <Image
                src={current.url}
                alt={current.name || "Media"}
                width={1600}
                height={1200}
                sizes="(max-width: 768px) 90vw, 80vw"
                className="h-auto w-auto max-h-[80vh] min-w-44 min-h-44 max-w-[90vw] object-contain rounded-lg"
              />
            </div>
          ) : null}

          {count > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white"
                aria-label="Previous"
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white"
                aria-label="Next"
              >
                <FaChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/90 text-xs">
                {idx + 1} / {count}
              </div>
            </>
          )}
        </div>
      </Modal>

      <div
        className={`w-full flex ${
          chat?.isOwn ? "justify-end" : "justify-start"
        } gap-2 mb-4`}
      >
        {chat?.isOwn && isLast && isSending && chat?.messageType === "MEDIA" ? (
          <div className="bg-black/40 h-56 w-56 rounded-lg flex items-center justify-center">
            <ClipLoader color="#ffff" />
          </div>
        ) : chat?.messageType === "TEXT" ? (
          <span
            className={`${
              chat?.isOwn
                ? "bg-dark text-light-main"
                : "bg-purple-blue-50 text-black"
            } rounded-lg xl:w-[50%] min-h-20 px-4 py-3 w-full`}
          >
            <Text.Paragraph>{chat?.message}</Text.Paragraph>
            <Text.SmallText
              className={`${
                chat?.isOwn ? "" : "text-dark-500 text-sm"
              } text-sm`}
            >
              {formatTo12Hour(new Date(chat?.createdAt))}
            </Text.SmallText>
          </span>
        ) : (
          <div
            className={`${
              chat?.isOwn
                ? "bg-black text-light-main"
                : "bg-purple-blue-50 text-black"
            } rounded-lg xl:w-[50%] min-h-44 px-3 py-3 w-full grid  relative`}
          >
            <div className={`flex flex-wrap gap-2`}>
              {chat?.media?.map((m: any, i: number) => {
                const key = (m?.url ?? "") + i;

                // VIDEO (unchanged)
                if (isVideo(m?.type)) {
                  return (
                    <button
                      key={key}
                      className="relative w-36 h-36  md:min-w-44 md:h-56"
                      onClick={() => openAt(i)}
                    >
                      <video
                        className="h-full w-full object-cover rounded-lg"
                        src={m.url}
                        controls
                        playsInline
                      />
                    </button>
                  );
                }

                // IMAGE (unchanged)
                if (isImage(m?.type)) {
                  return (
                    <button
                      className="flex justify-end  w-36 h-36  md:min-w-44 md:min-h-44 relative"
                      key={key}
                      onClick={() => openAt(i)}
                    >
                      <Image
                        src={m.url}
                        alt={m?.name || "Media"}
                        className="h-full w-full max-w-44  object-cover rounded-lg"
                        fill
                      />
                    </button>
                  );
                }

                // DOCUMENT (new)
                return (
                  <a
                    key={key}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-md border border-light-300 bg-white hover:bg-light-200 transition"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-light-300 text-dark text-xs font-semibold">
                      {m?.type === "application/pdf"
                        ? "PDF"
                        : m?.type?.includes("word")
                        ? "DOC"
                        : m?.type?.includes("excel") ||
                          m?.type?.includes("spreadsheet")
                        ? "XLS"
                        : m?.type?.includes("presentation")
                        ? "PPT"
                        : m?.type === "text/csv"
                        ? "CSV"
                        : "FILE"}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {m?.name || "Document"}
                      </div>
                      <div className="text-xs text-dark-500 truncate">
                        {m?.type || "application/octet-stream"}
                        {typeof m?.size === "number"
                          ? ` • ${(m.size / 1024 / 1024).toFixed(2)}MB`
                          : ""}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <Text.Paragraph>{chat?.message}</Text.Paragraph>
            <Text.SmallText
              className={`${
                chat?.isOwn ? "" : "text-dark-500 text-sm"
              } text-sm`}
            >
              {formatTo12Hour(new Date(chat?.createdAt))}
            </Text.SmallText>
          </div>
        )}
        {chat?.isOwn && isLast && isSending && chat?.messageType === "TEXT" ? (
          <ClipLoader size={20} color="#000" />
        ) : null}
      </div>
    </>
  );
};

type ChatInputProps = {
  onSend: () => Promise<void>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  attachments: File[];
  setAttachments: Dispatch<SetStateAction<File[]>>;
  disabled?: boolean;
  placeholder?: string;
  isSending: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({
  // onSend,
  placeholder = "Type a message...",
  message,
  setAttachments,
  attachments,
  setMessage,
  onSend,
  isSending,
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { curUser } = useUser();

  console.log(curUser?.data?._id);

  // const handleSend = () => {

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    const medias = attachments?.map((attch) => URL.createObjectURL(attch));

    try {
      setMessage("");
      await onSend();
      setAttachments([]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const disabled =
    (message.trim().length === 0 && attachments.length === 0) || isSending;

  // Optional: scroll input into view on mobile when focused
  useEffect(() => {
    const textarea = textareaRef.current;
    const handleFocus = () =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    textarea?.addEventListener("focus", handleFocus);
    return () => textarea?.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const generatePreviews = async () => {
      const urls = await Promise.all(
        attachments.map(async (file) => {
          // const convertedFile = await handleHeicFile(file); // convert HEIC if needed
          return URL.createObjectURL(file);
        })
      );
      setPreviewUrls(urls);
    };

    if (attachments.length > 0) {
      generatePreviews();
    } else {
      setPreviewUrls([]);
    }
  }, [attachments]);

  // console.log(attachments);

  return (
    <div className=" bottom-0 left-0 w-full z-50 bg-light-50 p-2 border-t border-light-100 rounded-2xl">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-2">
          {previewUrls.map((url, idx) => {
            if (isVideo(attachments[idx]?.type))
              return (
                <div className="relative" key={idx}>
                  <button
                    type="button"
                    className="absolute top-0 -right-2 w-5 h-5 rounded-full bg-dark-500 text-white text-xs flex items-center justify-center z-50 cursor-pointer"
                    onClick={() => removeAttachment(idx)}
                  >
                    ×
                  </button>
                  <video
                    className="w-16 h-16 object-cover rounded-lg"
                    src={url}
                    controls
                    playsInline
                  />
                </div>
              );

            if (isDocument(attachments[idx]?.type)) {
              const m = attachments[idx];

              return (
                <div className="relative" key={idx}>
                  <button
                    type="button"
                    className="absolute top-0 -right-2 w-5 h-5 rounded-full bg-dark-500 text-white text-xs flex items-center justify-center z-50 cursor-pointer"
                    onClick={() => removeAttachment(idx)}
                  >
                    ×
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 rounded-md border border-light-300 bg-white hover:bg-light-200 transition"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-light-300 text-dark text-xs font-semibold">
                      {m?.type === "application/pdf"
                        ? "PDF"
                        : m?.type?.includes("word")
                        ? "DOC"
                        : m?.type?.includes("excel") ||
                          m?.type?.includes("spreadsheet")
                        ? "XLS"
                        : m?.type?.includes("presentation")
                        ? "PPT"
                        : m?.type === "text/csv"
                        ? "CSV"
                        : "FILE"}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {m?.name || "Document"}
                      </div>
                      <div className="text-xs text-dark-500 truncate">
                        {m?.type || "application/octet-stream"}
                        {typeof m?.size === "number"
                          ? ` • ${(m.size / 1024 / 1024).toFixed(2)}MB`
                          : ""}
                      </div>
                    </div>
                  </a>
                </div>
              );
            }
            return (
              <div
                key={idx}
                className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-light-300 bg-white z-40"
              >
                <Image
                  src={url}
                  alt="attachment"
                  className="w-full h-full object-cover z-30"
                  fill
                />
                <button
                  type="button"
                  className="absolute top-0 -right-2 w-5 h-5 rounded-full bg-dark-500 text-white text-xs flex items-center justify-center z-50 cursor-pointer"
                  onClick={() => removeAttachment(idx)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Attach button */}
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={isSending}
          className="p-2 text-dark hover:text-black rounded-md transition-colors cursor-pointer"
        >
          <FaPaperclip />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none overflow-hidden px-3 py-1 rounded-lg border border-light-300 focus:outline-none focus:ring-0 text-dark placeholder-dark/50"
          disabled={isSending}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled}
          className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
            disabled
              ? "bg-[#d7d7d7] cursor-not-allowed"
              : "bg-dark-00 cursor-pointer"
          }`}
        >
          {isSending ? (
            <ClipLoader color="#000" size={10} />
          ) : (
            <FaArrowUp size={10} color="#ffffff" />
          )}
        </button>
      </div>
    </div>
  );
};
