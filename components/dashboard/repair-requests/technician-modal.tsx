"use client";

import React, { useMemo } from "react";
import Modal from "@/components/ui/customModal";
import Text from "@/components/ui/text";
import Box from "../home/box";
import Image, { StaticImageData } from "next/image";
import { icons, images } from "@/lib/constants";
import { Rating } from "@/components/ui/rating";
import { useState } from "react";
import { dummyCommHistory, messageTemplates } from "@/lib/dasboard-constatns";
import Button from "@/components/ui/custom-btn";
import { formatDateProper, formatTo12Hour } from "@/lib/helpers";
import Badge from "@/components/ui/badge";
import { useMessages } from "@/hook/useMessages";
import LoadingTemplate from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCall } from "@/contexts/call-provider";

const TechModal = ({
  tech,
  open,
  close,
  convId,
}: {
  tech: any;
  open: boolean;
  close: () => void;
  convId: string;
}) => {
  const [switched, setSwitched] = useState("Send Message");
  const router = useRouter();
  const {
    handleSendMessage,
    quickMessages,
    isLoadingQuickMessages,
    isSending,
  } = useMessages(convId);
  const { handleStartCall } = useCall();
  // console.log(tech);

  const contractor =
    tech?.contractors > 1
      ? tech?.contractors?.find(
          (cnt: any) => cnt?.id === (tech?.contractor?.id || tech?.contractor)
        )
      : tech?.contractors[0];

  console.log(contractor);

  const quicktxt = quickMessages?.data?.quickMessages;

  const handleSend = async (message: string) => {
    try {
      await handleSendMessage({
        id: convId,
        message: {
          type: "TEXT",
          message,
        },
      });

      toast.success("Message sent successfully");
      close();
      router.push(`/inbox/${convId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleViewChat = () => {
    router.push(`/inbox/${convId}`);
  };
  return (
    <Modal onClose={close} isOpen={open}>
      {isLoadingQuickMessages ? (
        <div className="min-h-96">
          <LoadingTemplate />
        </div>
      ) : (
        <div className="flex-cols gap-2">
          <Text.SmallHeading>Contact Technician</Text.SmallHeading>
          <Text.Paragraph className="text-dark-500 text-sm">
            Communicate with your assigned contractor about the ongoing job
          </Text.Paragraph>

          <Box px="px-2">
            <div className="flex flex-col gap-4 md:flex-row ">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={contractor?.profilePhoto || images.technician}
                    height={24}
                    width={24}
                    className="rounded-full "
                    alt="Technician"
                  />

                  <span>
                    {contractor?.firstName} {contractor?.lastName}
                    {/* <span className="text-xs text-dark-500">job: #1234</span> */}
                  </span>
                </div>

                {/* <Text.SmallText className="text-dark-500 text-xs">
                  Description: {tech?.description}
                </Text.SmallText> */}

                <div className="flex items-center gap-2">
                  {/* <Rating defaultValue={5} disabled />
                  <Text.Paragraph className="text-sm text-dark-400">
                    (156 Jobs)
                  </Text.Paragraph> */}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {tech?.schedule && (
                  <Text.SmallHeading className="font-semibold text-sm">
                    Appointment scheduled for{" "}
                    {formatDateProper(new Date(tech?.schedule?.startDate))}
                    {"  "}
                    {formatTo12Hour(new Date(tech?.schedule?.startDate))} -{" "}
                    {/* {formatDateProper(new Date(tech?.schedule?.startDate))}{" "} */}
                    {formatTo12Hour(new Date(tech?.schedule?.endDate))}
                  </Text.SmallHeading>
                )}
                {/* <Text.SmallText>Last updated: 15 minutes ago</Text.SmallText> */}
                <Text.SmallText className="text-dark-500 text-xs">
                  Remark: {tech?.schedule?.remark}
                </Text.SmallText>
                <div className="flex items-center">
                  <button
                    className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer"
                    onClick={() =>
                      handleStartCall({
                        toUser: contractor?.id,
                        toUserType: "contractors",
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
                  <button
                    className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer"
                    onClick={handleViewChat}
                  >
                    <Image
                      src={icons.chatIconActive2}
                      height={20}
                      width={20}
                      alt="Chat icon"
                    />
                  </button>
                </div>
              </div>
            </div>
          </Box>

          <div className="border-t border-t-light-50 mt-4 py-2 flex-cols gap-2">
            {/* <PageToggler
              setSwitched={setSwitched}
              switched={switched}
              btn1={"Send Message"}
              btn2="Communication History"
            /> */}

            {switched.toLowerCase().includes("message") ? (
              <Messaging
                quickTexts={quicktxt || messageTemplates}
                onSendMessage={handleSend}
                isSending={isSending}
              />
            ) : (
              <CommHistory />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TechModal;

const Messaging = ({
  quickTexts,
  onSendMessage,
  isSending,
}: {
  quickTexts: string[];
  onSendMessage: (message: string) => void;
  isSending: boolean;
}) => {
  const [message, setMessage] = useState("");
  return (
    <>
      <Text.Paragraph className="font-[500] ">
        Quick Message Templates
      </Text.Paragraph>

      <div className="grid grid-cols-2 gap-4 my-2">
        {quickTexts?.map((mes) => (
          <Box key={mes}>
            <button className="cursor-pointer" onClick={() => setMessage(mes)}>
              <Text.Paragraph className="text-sm text-start">
                {mes}
              </Text.Paragraph>
            </button>
          </Box>
        ))}
      </div>

      <Text.Paragraph className="font-[500] ">
        Send Custom Message
      </Text.Paragraph>

      <div className="input-container py-4">
        <textarea
          rows={4}
          cols={4}
          className="text-input"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
      </div>

      <Button className="mt-4" disabled={isSending || !message}>
        <Button.Icon>
          {isSending ? (
            <ClipLoader size={24} color="#fff" />
          ) : (
            <Image
              src={icons.Vector}
              height={17}
              width={17}
              alt="message icon"
            />
          )}
        </Button.Icon>

        <Button.Text onClick={() => onSendMessage(message)}>
          {isSending ? "Sending Text..." : "Send Message"}
        </Button.Text>
      </Button>
    </>
  );
};

const CommHistory = () => {
  return (
    <>
      <Text.Paragraph className="font-[500] ">
        Recent Communication{" "}
      </Text.Paragraph>

      <div className="flex-cols gap-4">
        {dummyCommHistory.map((dum, i) => (
          <CommItem key={i} item={dum as ComItemType} />
        ))}
      </div>
    </>
  );
};

type ComItemType = {
  type: "message" | "call";
  item: {
    initiator: string;
    message: string;
    createdAt: Date;
  };
};

type Item = {
  item: ComItemType;
};
const CommItem = ({ item }: Item) => {
  return (
    <div className="flex items-center justify-between border-b border-b-light-0 py-2">
      <div className="flex items-center gap-2">
        {item.type === "call" ? (
          <Image src={icons.callIcon} height={20} width={20} alt="Call icon" />
        ) : (
          <Image
            src={icons.chatIconActive2}
            height={20}
            width={20}
            alt="Chat icon"
          />
        )}
        <div className="flex-cols gap-2">
          <Text.Paragraph>{item?.item?.initiator}</Text.Paragraph>
          <Text.Paragraph className="text-dark-500">
            {item?.item.message}
          </Text.Paragraph>
        </div>
      </div>

      <Text.Paragraph className="text-dark-500">
        {formatTo12Hour(item?.item.createdAt)}
      </Text.Paragraph>
    </div>
  );
};

type BtnItem = {
  /** Visible text */
  label: string;
  /** Unique value used for selection */
  value: string;
  /** Optional numeric/string badge (e.g., counts) */
  badgeCount?: number | string;
  /** Icon can be an <img> URL (string) or a ReactNode (e.g., <SomeIcon />) */
  icon?: StaticImageData;
  disabled?: boolean;
};

type PageTogglerProps = {
  setSwitched: (v: any) => void;
  switched: any;
  /** Legacy props (kept intact) */
  btn1?: string;
  btn2?: string;
  /** New richer API: any number of buttons with badges/icons */
  btns?: BtnItem[];
  size?: "sm" | "md" | "lg";
  className?: string;
};

// ...your existing types above (BtnItem, PageTogglerProps etc.)

export const PageToggler: React.FC<
  PageTogglerProps & {
    // ⬇️ ADD these optional props
    syncUrl?: boolean;
    paramKey?: string;
  }
> = ({
  setSwitched,
  switched,
  btn1,
  btn2,
  btns,
  size = "md",
  className = "",
  // ⬇️ defaults for the new URL-sync behavior
  syncUrl = true,
  paramKey = "tab",
}) => {
  // ⬇️ ADD these Next Router hooks (safe in client)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build a normalized options list while keeping backward compatibility
  const options = useMemo<BtnItem[]>(() => {
    if (btns && btns.length > 0) return btns;

    const legacy = [btn1, btn2]
      .filter(Boolean)
      .map((label) => ({ label: label as string, value: label as string }));

    return legacy.length >= 2
      ? legacy
      : [
          { label: "One", value: "One" },
          { label: "Two", value: "Two" },
        ];
  }, [btn1, btn2, btns]);

  // ⬇️ READ from URL on mount / param change (only if syncUrl)
  React.useEffect(() => {
    if (!syncUrl) return;
    const urlValue = searchParams.get(paramKey);
    if (!urlValue) return;
    // only switch if the URL value is a valid option and differs from current state
    const exists = options.some((o) => o.value === urlValue);
    if (exists && urlValue !== switched) {
      setSwitched(urlValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, paramKey, searchParams, options]);

  // ⬇️ WRITE to URL whenever `switched` changes (only if syncUrl)
  React.useEffect(() => {
    if (!syncUrl) return;
    if (!pathname) return;

    const sp = new URLSearchParams(searchParams.toString());
    // keep other params intact; set/replace our key
    sp.set(paramKey, String(switched));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, paramKey, switched, pathname]);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === switched)
  );
  const segWidthPct = 100 / options.length;

  const dims = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          h: "h-8",
          pad: "p-1",
          text: "text-xs",
          pill: "h-6",
          padRem: 0.25 * 2,
        };
      case "lg":
        return {
          h: "h-14",
          pad: "p-2.5",
          text: "text-sm md:text-base",
          pill: "h-10",
          padRem: 0.625 * 2,
        };
      default:
        return {
          h: "h-12",
          pad: "p-2",
          text: "text-xs md:text-sm",
          pill: "h-8",
          padRem: 0.5 * 2,
        };
    }
  }, [size]);

  return (
    <>
      <div
        role="tablist"
        aria-label="Page toggler"
        className={`relative w-full rounded-full bg-light-400 overflow-hidden ${dims.h} ${dims.pad} grid ${className}`}
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {/* Highlight */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <div
            className={`absolute top-[50%] -translate-y-[50%] rounded-full bg-white shadow-md ${dims.pill} transition-transform duration-300 ease-in-out`}
            style={{
              width: `calc(${segWidthPct}% - ${dims.padRem}rem)`,
              transform: `translateX(calc(${selectedIndex * 100}% + ${
                dims.padRem / 2
              }rem))`,
              left: 0,
            }}
          />
        </div>

        {/* Buttons */}
        {options.map((opt, idx) => {
          const isSelected = opt.value === switched;
          const disabled = !!opt.disabled;

          const badge =
            opt.badgeCount !== undefined &&
            opt.badgeCount !== null &&
            Number(opt.badgeCount) > 0 ? (
              <Badge count={opt.badgeCount} isActive />
            ) : null;

          const icon = (
            <Image
              src={opt.icon}
              alt=""
              aria-hidden="true"
              className="w-4 h-4 shrink-0 hidden md:flex"
              loading="lazy"
            />
          );
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`seg-panel-${opt.value}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={disabled}
              className={`relative z-10 ${dims.h} ${dims.text}
                transition-colors duration-300 ease-in-out
                ${isSelected ? "text-black" : "text-dark-500"}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                flex items-center justify-center gap-2 select-none pt-4  h-full -translate-y-[20%] md:-translate-y-[25%] `}
              onClick={() => !disabled && setSwitched(opt.value)}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSwitched(opt.value);
                }
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const next = (idx + 1) % options.length;
                  setSwitched(options[next].value);
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const prev = (idx - 1 + options.length) % options.length;
                  setSwitched(options[prev].value);
                }
              }}
            >
              {icon}
              <span className="inline-flex items-center mx-2">
                <span>{opt.label}</span>
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Switch with Fade Transition (kept as-is) */}
      <div
        className="transition-opacity duration-300 ease-in-out"
        key={switched}
      />
    </>
  );
};
