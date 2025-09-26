"use client";

import Text from "@/components/ui/text";
import { PlanBadge } from "../home/plan-log";
import { useState } from "react";
import { PageToggler } from "../repair-requests/technician-modal";
import { SpecialBox } from "../home/job-toast-modal";
import Image from "next/image";
import { icons, images } from "@/lib/constants";
import { FaClock } from "react-icons/fa6";
import { BsStar } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hook/useMessages";
import { ClipLoader } from "react-spinners";
import LoadingTemplate from "@/components/ui/spinner";
import { MessageItem } from "@/utils/types";
import { formatDateProper } from "@/lib/helpers";

const togglers = [
  { label: "Messages", value: "Message", badgeCount: 1 },
  { label: "Call logs", value: "Call logs", badgeCount: 1 },
];
const Inbox = () => {
  const [switched, setSwitched] = useState<any>(togglers[0]);

  const {
    allMessages,
    fetchNextMessagesPage,
    hasNextMessagesPage,
    isFetchingNextMessagesPage,
    messagesStatus,
    refetchMessages,
    isLoadingMessages,
    flattenedMessages,
    sentinelRef,
  } = useMessages();
  console.log(messagesStatus);
  // console.log(allMessages);

  if (isLoadingMessages) return <LoadingTemplate />;
  return (
    <main className="flex flex-col gap-5">
      <div className="flex-row-between">
        <Text.Heading>Inbox</Text.Heading>
        <PlanBadge planName={`${3} active conversations`} />
      </div>

      {/* <PageToggler
        setSwitched={(s) => setSwitched(s)}
        switched={switched}
        btns={togglers}
      /> */}

      <ConversationHeader
        header="Conversations with Technicians"
        tag="Chat with technicians assigned to your ongoing jobs. You can only message technicians while you have active work with them."
      />

      <section className="flex flex-col gap-3">
        {switched?.label === "Messages" || switched === "Message"
          ? flattenedMessages?.map((message: MessageItem) => (
              <ConversationItem
                type="message"
                item={message}
                key={message?.id}
              />
            ))
          : // <ConversationItem
            //   type="call"
            //   item={{
            //     name: "Mike Johnson",
            //     id: "(555) 123-4567 Plumbing - Kitchen Job #1234",
            //     progress: "Awaiting arrival",
            //     sm: "Today at 10:45 AM - Duration 5:32",
            //     status: "incoming call",
            //   }}
            // />

            null}
      </section>

      <div ref={sentinelRef} className="h-12" />

      <div className="flex-row-center w-full">
        {isFetchingNextMessagesPage && <ClipLoader size={24} color="#000" />}
      </div>
    </main>
  );
};

export default Inbox;

const ConversationHeader = ({
  header,
  tag,
}: {
  header: string;
  tag: string;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Text.SubHeading>{header}</Text.SubHeading>
      <Text.SmallText className="text-sm text-dark-500">{tag}</Text.SmallText>
    </div>
  );
};

const ConversationItem = ({
  type,
  item,
}: {
  item: MessageItem;
  type: "message" | "call";
}) => {
  const router = useRouter();

  console.log();
  return (
    <SpecialBox
      isBtn
      className="border border-dark-10 p-4"
      onClick={() => router.push(`/inbox/${item?.id || 1234}`)}
    >
      <div className="flex items-start  justify-between ">
        <div className="flex items-start gap-2 md:gap-4">
          <div className="md:h-13 md:w-13 h-8 w-8 rounded-full relative">
            <Image
              src={item?.heading?.image}
              fill
              alt="Contractors image"
              className="rounded-full h-full w-full"
            />
          </div>
          <div className="flex flex-col items-start gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Text.Paragraph className="font-semibold text-base md:text-lg">
                {item?.heading?.name}
              </Text.Paragraph>
              {/* <PlanBadge
                planName={item?.entityType}
                defaultPadding="px-2 md:px-5"
                className="bg-white py-2"
              /> */}
            </div>
            <Text.SmallText className="text-sm text-dark-500 text-start">
              {item?.lastMessage}
            </Text.SmallText>
            {type === "message" && (
              <Text.SmallText className="text-sm text-dark-500 text-start"></Text.SmallText>
            )}

            {type === "call" && (
              <div
                className={` 
                   flex items-center gap-2
                 `}
              >
                <FaClock color="#72777a" />

                <div className="flex-rows gap-2">
                  <Text.SmallText className="text-xs text-dark-500">
                    {formatDateProper(
                      new Date(item?.lastMessageAt || item?.createdAt)
                    )}
                  </Text.SmallText>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
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
              <Image
                src={icons.eyeIcon}
                height={20}
                width={20}
                alt="Chat icon"
              />
            </button>
          </div>
        </div>
      </div>
      {type === "message" && (
        <div
          className={` ${
            type === "message"
              ? "border-t-[#ededed] py-2 flex-row-between mt-4 border-t"
              : "flex items-center gap-2"
          } `}
        >
          <div className="flex-rows gap-2">
            <FaClock color="#72777a" />
            <Text.SmallText className="text-xs text-dark-500">
              {formatDateProper(
                new Date(item?.lastMessageAt || item?.createdAt)
              )}
            </Text.SmallText>
          </div>
          <div className="flex-rows gap-2">
            {type === "message" && (
              <div className="flex-rows gap-1">
                {/* <BsStar color="#72777a" /> */}
                <Text.SmallText className="text-xs text-dark-500">
                  {/* 5 */}
                </Text.SmallText>
              </div>
            )}
            <Text.SmallText className="text-xs text-dark-500">
              {/* {item?.sm} */}
            </Text.SmallText>
          </div>
        </div>
      )}
    </SpecialBox>
  );
};
