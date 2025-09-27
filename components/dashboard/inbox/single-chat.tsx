"use client";

import Text from "@/components/ui/text";
import { SpecialBox } from "../home/job-toast-modal";
import { PlanBadge } from "../home/plan-log";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { FaArrowUp, FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hook/useMessages";
import LoadingTemplate from "@/components/ui/spinner";
import { Message, singleConversationType } from "@/utils/types";
// import { formatTo12Hour, handleHeicFile } from "@/lib/helpers";
// import { formatTo12Hour } from "@/lib/helpers";
import { format, isToday, isYesterday } from "date-fns";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa";
import { formatTo12Hour } from "@/lib/helpers";

const SingleChatItem = ({ id }: { id: string }) => {
  const {
    singleChat,
    isLoadingSingleChat,
    flattenedChatMessages,
    isSending,
    handleSendMessage,
  } = useMessages();
  const [message, setMessage] = useState("");

  const [attachments, setAttachments] = useState<File[]>([]);

  const [messagesToRender, setMessagesToRender] = useState<Message[]>();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesToRender]);

  if (isLoadingSingleChat) return <LoadingTemplate />;

  let lastMessageDate: string | null = null;

  // console.log(flattenedChatMessages);

  return (
    <main className="flex flex-col h-screen">
      {/* Chat header */}
      <ChatHeader item={singleChat?.data} />

      {/* Messages container */}
      <section className="flex-1 overflow-y-auto scrollbar-hidden px-2 py-2">
        {flattenedChatMessages?.map((mess: Message) => {
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
              <ChatItem chat={mess} />
            </div>
          );
        })}
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
                // media: attachments,
                type: "TEXT",
              },
            });
            setAttachments([]);
            setMessage("");
          }}
        />
      </div>
    </main>
  );
};

export default SingleChatItem;

// Helper: returns 'Today', 'Yesterday', or formatted date

function formatMessageDay(dateString: string) {
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
          {item?.entity ? (
            <PlanBadge
              planName={item?.entity?.status}
              defaultPadding="px-2 md:px-5"
              className="bg-white py-2"
            />
          ) : null}
        </div>

        <div className="flex items-center ">
          <button className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
            <Image
              src={icons.callIcon}
              height={20}
              width={20}
              alt="Call icon"
            />
          </button>
          <button className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
            <Image src={icons.eyeIcon} height={20} width={20} alt="Chat icon" />
          </button>
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

const ChatItem = ({ chat }: { chat: Message }) => {
  // console.log(chat);
  return (
    <div
      className={`w-full flex ${
        chat?.isOwn ? "justify-end" : "justify-start"
      } gap-2 mb-4`}
    >
      <span
        className={`${
          chat?.isOwn
            ? "bg-dark text-light-main"
            : "bg-purple-blue-50 text-black"
        } rounded-lg xl:w-[50%] min-h-20 px-4 py-3 w-full`}
      >
        <Text.Paragraph>{chat?.message}</Text.Paragraph>
        <Text.SmallText
          className={`${chat?.isOwn ? "" : "text-dark-500 text-sm"} text-sm`}
        >
          {formatTo12Hour(new Date(chat?.createdAt))}
        </Text.SmallText>
      </span>
    </div>
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
};

const ChatInput: React.FC<ChatInputProps> = ({
  // onSend,
  placeholder = "Type a message...",
  message,
  setAttachments,
  attachments,
  setMessage,
  onSend,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // const handleSend = () => {

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    const medias = attachments?.map((attch) => URL.createObjectURL(attch));

    try {
      await onSend();
      setMessage("");
      setAttachments([]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
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
          <FaArrowUp size={10} color="#ffffff" />
        </button>
      </div>
    </div>
  );
};
