"use client";

import Text from "@/components/ui/text";
import { useState } from "react";
import { PageToggler } from "../repair-requests/technician-modal";
import { PlanBadge } from "../home/plan-log";
import { SpecialBox } from "../home/job-toast-modal";
import { HiUser } from "react-icons/hi";
import Button from "@/components/ui/custom-btn";
import { useNotification } from "@/hook/useNotification";
import LoadingTemplate from "@/components/ui/spinner";
import { ClipLoader } from "react-spinners";
import { Notification } from "@/utils/types";
import { getTimeAgo } from "@/lib/helpers";
import { useSocket } from "@/contexts/socket-contexts";
import Image from "next/image";

const Notifs = () => {
  const [switched, setSwitched] = useState("Notifications");

  const {
    // handleAllReadNotifs,
    allNotifications,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    sentinelRef,
    unreadCount,
  } = useNotification();

  const { handleReadNotifs } = useSocket();

  // console.log(allNotifications);

  // console.log(hasNextPage);

  if (isLoading) return <LoadingTemplate />;
  return (
    <main className="flex-cols gap-4">
      <div className="flex-row-between">
        <Text.SmallHeading>Notifications</Text.SmallHeading>

        <PlanBadge planName={`${unreadCount} unread`} />
      </div>
      {/* <PageToggler
        setSwitched={setSwitched}
        switched={switched}
        btn1="Notifications"
        btn2="Actions"
      /> */}

      {switched.toLowerCase() === "notifications" ? (
        <div className="gap-2 flex-cols">
          <Text.SmallHeading>Recent Notification</Text.SmallHeading>

          {allNotifications?.map((not) => (
            <NotifItem key={not._id} notif={not} onRead={handleReadNotifs} />
          ))}
        </div>
      ) : (
        <div className="gap-2 flex-cols">
          <Text.SmallHeading>Job Actions</Text.SmallHeading>
          <Text.SmallText className="text-sm text-dark-500 ">
            Track job requests received, accepted, and completed
          </Text.SmallText>
          <ActionsItem />
        </div>
      )}
      <div ref={sentinelRef} className="h-12" />

      <div className="flex-row-center w-full">
        {isFetchingNextPage && <ClipLoader size={24} color="#000" />}
      </div>
    </main>
  );
};

export default Notifs;

const NotifItem = ({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) => {
  // console.log(notif?.heading);

  return (
    <SpecialBox
      className={`border border-dark-10 flex-row-between px-2 md:px-4 py-2`}
      isBtn
      onClick={() => onRead(notif?._id)}
      isRead={Boolean(notif.readAt)}
    >
      <div className="flex-rows gap-2 w-[80%]">
        <div className="h-8 min-w-8 relative rounded-full flex-row-center bg-red-100">
          {notif?.heading?.image ? (
            <Image
              src={notif?.heading?.image}
              fill
              alt="Notification image"
              className="rounded-full"
            />
          ) : (
            <HiUser />
          )}
        </div>

        <div className="">
          <Text.SmallText className="text-sm md:text-base text-dark-500 font-semibold capitalize text-start">
            {notif.type?.replaceAll("_", " ")?.toLowerCase()}
          </Text.SmallText>

          <Text.SmallText className="text-xs md:text-sm text-dark-500 text-start">
            {notif.message}
          </Text.SmallText>
        </div>
      </div>

      <div className=" ">
        <Text.SmallText className="text-xs md:text-sm text-dark-500 ">
          {getTimeAgo(new Date(notif.createdAt)?.toISOString())}
        </Text.SmallText>
      </div>
    </SpecialBox>
  );
};

const ActionsItem = () => {
  return (
    <SpecialBox className="border border-dark-10 flex-row-between px-2 md:px-4 py-2">
      <div className="flex items-start gap-2">
        <div className="h-8 min-w-8 rounded-full flex-row-center bg-red-100">
          <HiUser />
        </div>
        <div className="flex-cols gap-2">
          <Text.SmallText className="text-base text-dark-500 font-semibold">
            Customer has viewed your site
          </Text.SmallText>
          <Text.SmallText className="text-sm text-dark-500 ">
            Customer has viewed your site visit request for a job on RepairFind.
            stay active and expect a response soon.{" "}
          </Text.SmallText>

          <div>
            <Button>
              <Button.Text>Send Estimate</Button.Text>
            </Button>
          </div>
        </div>
      </div>

      <Text.SmallText className="text-sm text-dark-500 ">
        2 minutes ago
      </Text.SmallText>
    </SpecialBox>
  );
};
