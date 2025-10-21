"use client";

import Text from "@/components/ui/text";
import { useState } from "react";
import { PageToggler } from "../repair-requests/technician-modal";
import { SpecialBox } from "../home/job-toast-modal";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { FaClock } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hook/useMessages";
import { ClipLoader } from "react-spinners";
import LoadingTemplate from "@/components/ui/spinner";
import { CallItem, MessageItem } from "@/utils/types";
import {
  durationHMM_SS,
  formatDateProper,
  formatTo12Hour,
  trim100,
} from "@/lib/helpers";
import EmptyPage from "@/components/ui/empty";
import { useUser } from "@/hook/useMe";
import { useCall } from "@/contexts/call-provider";
import { useCallLogs } from "@/hook/useCallogs";
import { formatMessageDay } from "./single-chat";

const togglers = [
  { label: "Messages", value: "Message", badgeCount: 0 },
  { label: "Call logs", value: "Call logs", badgeCount: 0 },
];
const Inbox = () => {
  const [switched, setSwitched] = useState<any>(togglers[0]);

  console.log(switched);

  const {
    isFetchingNextMessagesPage,
    isLoadingMessages,
    flattenedMessages,
    sentinelRef,
  } = useMessages();

  const {
    allLogs,
    setSentinel,
    isLoading,

    isFetchingNextPage,
  } = useCallLogs();
  // console.log(flattenedMessages[0]);

  // const { curUser } = useUser();

  // console.log(curUser?.data?._id);

  // useEffect(() => {});
  const isMessages = switched?.label === "Messages" || switched === "Message";

  // console.log(isMessages);
  const displayLength = isMessages
    ? flattenedMessages?.length > 0
    : allLogs?.length > 0;

  if (isMessages ? isLoadingMessages : isLoading) {
    return <LoadingTemplate />;
  }
  return (
    <main className="flex flex-col gap-5">
      <div className="flex-row-between">
        <Text.Heading>Inbox </Text.Heading>
        {/* <PlanBadge planName={`${3} active conversations`} /> */}
      </div>

      <PageToggler
        setSwitched={(s) => setSwitched(s)}
        switched={switched}
        btns={togglers}
      />

      {displayLength ? (
        <>
          <ConversationHeader
            header="Conversations with Technicians"
            tag="Chat with technicians assigned to your ongoing jobs. You can only message technicians while you have active work with them."
          />
          <section className="flex flex-col gap-3">
            {isMessages
              ? flattenedMessages.map((m: any) => (
                  <ConversationItem type="message" message={m} key={m?.id} />
                ))
              : allLogs.map((c) => (
                  <ConversationItem type="call" call={c} key={c?._id} />
                ))}
          </section>
        </>
      ) : (
        <EmptyPage
          message={
            isMessages
              ? "You do not have any active chats"
              : "You do not have any call history"
          }
          tytle={isMessages ? "Chats" : "Call Logs"}
        />
      )}
      <div ref={isMessages ? sentinelRef : setSentinel} className="h-12" />

      <div className="flex-row-center w-full">
        {isMessages
          ? isFetchingNextMessagesPage && <ClipLoader size={24} color="#000" />
          : isFetchingNextPage && <ClipLoader size={24} color="#000" />}
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
  message,
  call,
}: {
  type: "message" | "call";
  message?: MessageItem;
  call?: CallItem;
}) => {
  const router = useRouter();

  const { handleStartCall } = useCall();

  const item = type === "message" ? message : call;

  const { curUser } = useUser();

  const curUserId = curUser?.data?._id;

  return (
    <SpecialBox
      isBtn
      className="border border-dark-10 p-4"
      onClick={() =>
        type === "message" && router.push(`/inbox/${message?.id || 1234}`)
      }
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
              {type === "message"
                ? trim100(message?.lastMessage)
                : call?.phoneNumber
                ? call?.phoneNumber?.code + " " + call?.phoneNumber?.number
                : " "}
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
                    {formatMessageDay(call?.startTime)}
                    {` at ${formatTo12Hour(new Date(call?.startTime))}, `}
                    {call?.duration &&
                      `Duration ${durationHMM_SS(
                        call?.startTime,
                        call?.endTime
                      )}`}
                  </Text.SmallText>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center ">
            <button
              className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative"
              onClick={async (e) => {
                e.stopPropagation();

                const contractor = message?.members?.find(
                  (mem) => mem.member !== curUserId
                );
                const toCallUserId =
                  call && call?.fromUser === curUserId
                    ? call?.toUser
                    : call?.fromUser;
                const toCallUserType =
                  call && call?.fromUser === curUserId
                    ? call?.toUserType
                    : call?.fromUserType;

                console.log(call);
                await handleStartCall({
                  toUser:
                    type === "message" ? contractor?.member : toCallUserId,
                  toUserType:
                    type === "message"
                      ? contractor?.memberType
                      : toCallUserType,
                });
              }}
            >
              <Image
                src={icons.callIcon}
                height={20}
                width={20}
                alt="Call icon"
              />
            </button>
            {/* <button className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
              <Image
                src={icons.eyeIcon}
                height={20}
                width={20}
                alt="Chat icon"
              />
            </button> */}
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
                new Date(
                  type === "message" ? message?.lastMessageAt : call?.startTime
                )
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
