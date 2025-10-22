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
import {
  LANG_ID,
  Notification,
  QuickActions,
  Subscription,
} from "@/utils/types";
import { getTimeAgo, readStringCookie } from "@/lib/helpers";
import { useSocket } from "@/contexts/socket-contexts";
import Image from "next/image";
import Modal from "@/components/ui/customModal";
import dayjs, { Dayjs } from "dayjs";
import { InputContainer } from "@/components/auth/signup-item";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ToggleBtn from "@/components/ui/toggle-btn";

const Notifs = () => {
  const [switched, setSwitched] = useState("Notifications");
  const [openModal, setOpenModal] = useState(false);
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const [time, setTime] = useState<Dayjs | null>(dayjs());
  const [message, setMessage] = useState("");
  const [toggle, setToggle] = useState<boolean>(false);

  const [subs, setSubs] = useState<Subscription>();

  const [open, setOpen] = useState({
    time: false,
    date: false,
  });

  const language = readStringCookie(LANG_ID);

  // console.log();

  const {
    // handleAllReadNotifs,
    allNotifications,
    isFetchingNextPage,
    isLoading,
    sentinelRef,
    unreadCount,

    isLoadingACtions,

    allActions,
    sentinelAction,
    handleSetInspection,
    inspecting,
  } = useNotification();

  const { handleReadNotifs } = useSocket();

  console.log(allActions);

  // console.log(hasNextPage);

  if (isLoading || isLoadingACtions) return <LoadingTemplate />;
  return (
    <main className="flex-cols gap-4">
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
        <form>
          <div className="flex-cols gap-2 mb-8">
            <Text.SubHeading className="text-lg font-semibold">
              Schedule Your Inspection date
            </Text.SubHeading>
            {/* <Text.SmallText className="text-dark-500 text-sm">
              Fill out the form below to submit a new service request. We'll
              match you with qualified professionals in your area.
            </Text.SmallText> */}
          </div>
          <div className="">
            <div className="flex-col gap-4 mb-4">
              <div className="flex-rows mb-2">
                <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
                  Prefered date
                </Text.Paragraph>
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select date"
                  value={value}
                  onChange={setValue}
                  open={open.date}
                  onClose={() =>
                    setOpen((op) => ({
                      ...op,
                      date: false,
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onClick: () =>
                        setOpen({
                          date: true,
                          time: false,
                        }),
                      InputProps: { sx: { color: "text.primary" } }, // black input text
                    } as any,
                    popper: { disablePortal: true }, // render inside dialog instead of body
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="flex-col gap-4 mb-4">
              <div className="flex-rows mb-2">
                <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
                  Prefered time
                </Text.Paragraph>
              </div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Select time"
                  value={time}
                  onChange={setTime}
                  // ampm // 12-hour clock; remove for 24h
                  // shouldDisableTime={shouldDisableTime}
                  open={open.time}
                  onClose={() =>
                    setOpen((op) => ({
                      ...op,
                      time: false,
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onClick: () =>
                        setOpen({
                          date: false,
                          time: true,
                        }),
                    } as any,
                    popper: { disablePortal: true }, // render inside dialog instead of body
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className="flex flex-col">
            <Text.Paragraph className="font-semibold">
              Message (optional)
            </Text.Paragraph>
            <InputContainer>
              <textarea
                rows={4}
                cols={4}
                className="text-input py-2"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Enter any message you want to relay"
              />
            </InputContainer>
          </div>
          <div className="flex-rows gap-2 mt-8">
            <Text.Paragraph className="font-semibold">Emergency</Text.Paragraph>
            <ToggleBtn
              toggle={toggle}
              onClick={() => setToggle((tg) => !tg)}
              emergency
            />
          </div>

          <div className="flex items-center gap-4 mt-8 w-full">
            <Button
              className="w-full"
              onClick={() =>
                handleSetInspection({
                  date: dayjs(value).format("YYYY-MM-DD"),
                  time: dayjs(time).format("HH:mm"),
                  // description: message,
                  subscriptionId: subs?.id,
                  emergency: toggle,
                })
              }
              disabled={inspecting}
            >
              {inspecting && (
                <Button.Icon>
                  <ClipLoader size={16} />
                </Button.Icon>
              )}
              <Button.Text>
                {inspecting ? "Confirming inspection schedule..." : "Proceed"}
              </Button.Text>
            </Button>
          </div>
        </form>
      </Modal>
      <div className="flex-row-between">
        <Text.SmallHeading>Notifications</Text.SmallHeading>
        <PlanBadge planName={`${unreadCount} unread`} />
      </div>
      <PageToggler
        setSwitched={setSwitched}
        switched={switched}
        btn1="Notifications"
        btn2="Actions"
      />

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
          {allActions?.map((act) => (
            <ActionsItem key={act?._id} item={act} />
          ))}
        </div>
      )}
      {switched?.toLowerCase().includes("notification") ? (
        <div ref={sentinelRef} className="h-12" />
      ) : (
        <div ref={sentinelAction} className="h-12" />
      )}

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

const ActionsItem = ({ item }: { item: QuickActions }) => {
  return (
    <SpecialBox className="border border-dark-10 flex-row-between px-2 md:px-4 py-2">
      <div className="flex items-start gap-2">
        <div className="h-8 min-w-8 rounded-full flex-row-center bg-red-100 relative">
          {item?.image ? (
            <Image
              src={item?.image}
              fill
              alt="Notification image"
              className="rounded-full"
            />
          ) : (
            <HiUser />
          )}
        </div>
        <div className="flex-cols gap-2">
          <Text.SmallText className="text-base text-dark-500 font-semibold">
            {item?.title}
          </Text.SmallText>
          <Text.SmallText className="text-sm text-dark-500 ">
            {item?.description}
          </Text.SmallText>

          <div>
            <Button>
              <Button.Text>Proceed</Button.Text>
            </Button>
          </div>
        </div>
      </div>

      <Text.SmallText className="text-xs md:text-sm text-dark-500 ">
        {getTimeAgo(new Date(item.createdAt)?.toISOString())}
      </Text.SmallText>
    </SpecialBox>
  );
};
