"use client";

import Text from "@/components/ui/text";
import { icons, images } from "@/lib/constants";
import Image from "next/image";
import {
  Table,
  TableOverflow,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "../repair-requests/request-table";
import {
  MaintenanceItemType,
  maintenanceTableH,
  maintenanceTableRows,
  maintenanceLogData,
} from "@/lib/dasboard-constatns";
import {
  formatCurrency,
  formatDateProper,
  formatTo12Hour,
} from "@/lib/helpers";
import StatusCard from "@/components/ui/ststus-card";
// import Badge from "@/components/ui/badge";
import ActionDropdown from "../repair-requests/action-dropdown";
import { BsClock, BsEye, BsPerson } from "react-icons/bs";
import Box from "../home/box";
import { LabelTag } from "./priority-tag";
import { SpecialBox } from "../home/job-toast-modal";
import Button from "@/components/ui/custom-btn";

import { RepairJob } from "@/utils/repairtype";

const MaintenanceTable = ({ items }: { items: RepairJob[] }) => {
  return (
    <section className="flex flex-col gap-5">
      <TableHeader
        title="Completed Maintenance History"
        description="Review all past maintenance work and service records"
        icon={icons.clockIcon}
      />

      <TableOverflow>
        <Table>
          <Thead>
            <Tr className="bg-light-480">
              {maintenanceTableH.map((rep) => (
                <Th
                  key={rep.id}
                  className={rep.size === "sm" ? "hidden md:table-cell" : ""}
                >
                  <div className="flex flex-row items-center gap-2 font-normal text-sm">
                    {rep.id === "1" ? (
                      // <RadioCheck
                      //   checked={check}
                      //   setChecked={() => setCheck((ch) => !ch)}
                      // />
                      <></>
                    ) : null}
                    <span>{rep.name}</span>
                  </div>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {items.map((row) => (
              <Tr
                key={row?._id}
                className="border-b-[0.5px] border-b-light-300"
              >
                <Td>{row?.title}</Td>
                <Td className="">
                  {row.contractors?.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Image
                        src={row?.contractors[0]?.profilePhoto || images.tool2}
                        height={24}
                        width={24}
                        className="rounded-full hidden md:table-cell "
                        alt="Technician"
                      />

                      <Text.Paragraph className="text-xs">
                        {row?.contractors[0]?.firstName}{" "}
                        {row?.contractors[0]?.lastName}
                      </Text.Paragraph>
                    </div>
                  ) : (
                    <p>Not assigned yet</p>
                  )}
                </Td>
                <Td className="hidden md:table-cell">
                  {row?.schedule?.startDate
                    ? formatDateProper(new Date(row?.schedule.startDate))
                    : "__ __"}
                </Td>
                <Td>{row?.location?.address}</Td>
                <Td className="hidden md:table-cell">
                  <StatusCard status={row.status.toUpperCase() as "ONGOING"} />
                </Td>
                <Td className="hidden md:table-cell">
                  {row?.contractors?.length > 0 && (
                    <div className="flex items-center">
                      <button className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
                        {/* {rep?.missedCallsCount > 0 && (
                          <span
                            className="
                absolute top-0 right-0
                translate-x-1 -translate-y-1
                pointer-events-none
              "
                          >
                            <Badge count={0} isActive />
                          </span>
                        )} */}
                        <Image
                          src={icons.callIcon}
                          height={20}
                          width={20}
                          alt="Call icon"
                        />
                      </button>
                      <button className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
                        {/* {rep?.unreadMessages > 0 && (
                          <span
                            className="
                absolute top-0 right-0
                translate-x-1 -translate-y-1
                pointer-events-none
              "
                          >
                            <Badge count={rep?.unreadMessages} isActive />
                          </span>
                        )} */}
                        <Image
                          src={icons.chatIconActive2}
                          height={20}
                          width={20}
                          alt="Chat icon"
                        />
                      </button>
                    </div>
                  )}
                </Td>
                <Td>
                  <ActionDropdown
                    items={[
                      {
                        key: "View_status",
                        label: "View Status",
                        icon: <BsEye />,
                        onSelect: () => {},
                      },
                    ]}
                    trigger={
                      <button
                        aria-label="Open actions"
                        className="w-10 h-10 cursor-pointer flex items-center justify-center"
                      >
                        <Image
                          src={icons.moreIcon}
                          height={20}
                          width={24}
                          alt="Menu icon"
                        />
                      </button>
                    }
                    sideOffset={6}
                    align="end"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableOverflow>
    </section>
  );
};

const UpcomingMaintenanceTable = ({ items }: { items: RepairJob[] }) => {
  return (
    <section className="flex flex-col gap-5">
      <TableHeader
        title="Scheduled Maintenance & Due Dates"
        description="Keep track of when your home systems need attention"
        icon={icons.notificationIcon}
      />

      {items.map((item) => (
        <MaintenanceItem key={item._id} item={item} />
      ))}
    </section>
  );
};

const TableHeader = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: any;
}) => {
  return (
    <div className="flex gap-2 !items-start">
      <Image alt="Icon" src={icon} height={20} width={20} className="mt-1" />
      <div className="flex flex-col gap-1">
        <Text.SmallHeading className="!text-xl">{title}</Text.SmallHeading>

        <Text.SmallText className="text-dark-500 !text-xs">
          {description}
        </Text.SmallText>
      </div>
    </div>
  );
};

export { MaintenanceTable, UpcomingMaintenanceTable, TableHeader };

const MaintenanceItem = ({ item }: { item: RepairJob }) => {
  return (
    <SpecialBox className="p-3 border border-gray-400">
      <div className="flex items-center justify-between  ">
        <div className="flex items-center flex-wrap gap-4">
          <Text.SmallHeading className="!text-lg font-semibold">
            {item?.title}
          </Text.SmallHeading>
          {item?.tags?.map((tag) => (
            <LabelTag
              key={tag}
              label={tag}
              color={
                tag?.toLowerCase().includes("high") ||
                tag?.toLowerCase().includes("disputed") ||
                tag?.toLowerCase().includes("pending reschedule")
                  ? "red"
                  : tag?.toLowerCase().includes("scheduled")
                  ? "purple"
                  : tag?.toLowerCase().includes("reschedule") ||
                    tag?.toLowerCase().includes("ongoing")
                  ? "amber"
                  : "green"
              }
            />
          ))}
        </div>

        <StatusCard status={item.status as "ONGOING"} />
      </div>

      <div className="flex flex-col  gap-2">
        <div className="flex items-start gap-5 md:gap-16 xl:gap-30">
          <Text.Paragraph className="text-sm text-gray-500">
            Category: {item?.category}
          </Text.Paragraph>
          <div className="flex flex-col gap-2">
            <Text.Paragraph className="text-sm text-gray-500">
              Due Date:
            </Text.Paragraph>
            <Text.Paragraph className="text-sm font-bold">
              {formatDateProper(new Date(item.expiryDate))}
              {" at "}
              {formatTo12Hour(new Date(item.expiryDate))}
            </Text.Paragraph>
            {item?.schedule?.estimatedDuration > 0 && (
              <Text.Paragraph className="text-xs text-red-500">
                {item?.schedule?.estimatedDuration}
              </Text.Paragraph>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5 md:gap-16 xl:gap-30">
          <Text.Paragraph className="text-xs text-gray-500">
            Frequency: {item?.metadata?.autoCreated ? "Recurring" : "One-time"}
          </Text.Paragraph>
        </div>
        <div className="flex flex-col gap-3">
          <Text.Paragraph className="text-sm text-gray-500">
            Preferred contractor
          </Text.Paragraph>
          {item?.contractors?.length > 0 && (
            <div className="flex items-center gap-2">
              <Image
                src={images.tool2}
                height={24}
                width={24}
                className="rounded-full "
                alt="Technician"
              />

              <Text.Paragraph className="text-xs">
                {item?.contractors[0]?.firstName || "- -"}{" "}
                {item?.contractors[0]?.lastName || "- -"}
              </Text.Paragraph>
              <div className="flex items-center">
                <button className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
                  {/* {rep?.missedCallsCount > 0 && (
                          <span
                            className="
                absolute top-0 right-0
                translate-x-1 -translate-y-1
                pointer-events-none
              "
                          >
                            <Badge count={0} isActive />
                          </span>
                        )} */}
                  <Image
                    src={icons.callIcon}
                    height={20}
                    width={20}
                    alt="Call icon"
                  />
                </button>
                <button className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer relative">
                  {/* {rep?.unreadMessages > 0 && (
                          <span
                            className="
                absolute top-0 right-0
                translate-x-1 -translate-y-1
                pointer-events-none
              "
                          >
                            <Badge count={rep?.unreadMessages} isActive />
                          </span>
                        )} */}
                  <Image
                    src={icons.chatIconActive2}
                    height={20}
                    width={20}
                    alt="Chat icon"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Box className="bg-white mt-2">
        <Text.Paragraph className="text-sm text-gray-500">
          Service Notes:
        </Text.Paragraph>
        <Text.Paragraph className="text-sm">
          {item?.description || "- -"}
        </Text.Paragraph>
      </Box>
      {/* {item?.tags?.find((tag) => tag?.includes("Reschedule"))?.length > 0 ||
      item?.status?.toLowerCase()?.includes("disputed") ||
      item?.status?.toLowerCase()?.includes("ongoing") ? (
        <Box
          className={`${
            item?.rescheduleRequest?.by.toLowerCase().includes("customer") ||
            item?.status.toLowerCase().includes("disputed")
              ? "bg-red-100 !border-red-500"
              : item?.status?.toLowerCase()?.includes("ongoing")
              ? "border-red-300 bg-green-50"
              : "bg-amber-50/20 !border-amber-300"
          } mt-4`}
        >
          {item?.rescheduleRequest ? (
            <div className="flex flex-col gap-1">
              <div
                className={`${
                  item?.rescheduleRequest?.by.toLowerCase().includes("customer")
                    ? "text-red-500"
                    : "text-amber-500"
                } flex items-center gap-2`}
              >
                {item?.rescheduleRequest?.by
                  .toLowerCase()
                  .includes("customer") ? (
                  <BsClock />
                ) : (
                  <BsPerson />
                )}

                <Text.Paragraph>
                  {item?.rescheduleRequest?.by
                    .toLowerCase()
                    .includes("customer")
                    ? ""
                    : "Technician"}{" "}
                  Reschedule Request{" "}
                  {item?.rescheduleRequest?.by
                    .toLowerCase()
                    .includes("customer")
                    ? "Pending"
                    : ""}
                </Text.Paragraph>
              </div>
              <Text.Paragraph className="text-xs text-gray-400">
                Original:{" "}
                <span className="font-semibold">
                  {formatDateProper(
                    new Date(item?.rescheduleRequest?.original?.startISO)
                  )}{" "}
                  {" at " +
                    formatTo12Hour(
                      new Date(item?.rescheduleRequest?.original?.startISO)
                    )}{" "}
                  {" - " +
                    formatTo12Hour(
                      new Date(item?.rescheduleRequest?.original?.endISO)
                    )}
                </span>
              </Text.Paragraph>
              <Text.Paragraph className="text-xs text-gray-400">
                Requested:{" "}
                <span className="font-semibold">
                  <span className="font-semibold">
                    {formatDateProper(
                      new Date(item?.rescheduleRequest?.requested?.startISO)
                    )}{" "}
                    {" at " +
                      formatTo12Hour(
                        new Date(item?.rescheduleRequest?.requested?.startISO)
                      )}{" "}
                    {" - " +
                      formatTo12Hour(
                        new Date(item?.rescheduleRequest?.requested?.endISO)
                      )}
                  </span>
                </span>
              </Text.Paragraph>
              <Text.Paragraph className="text-xs text-gray-400 ">
                Reason: {item?.rescheduleRequest?.reason || "- -"}
              </Text.Paragraph>
              {item?.rescheduleRequest?.by
                .toLowerCase()
                .includes("customer") ? null : (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button className="!bg-green-500 !text-white">Accept</Button>
                  <Button className="!bg-transparent !border !border-green-500 !text-black">
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-400">
                  <Text.Paragraph
                    className={`${
                      item?.status?.toLowerCase()?.includes("disputed")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {item?.status?.toLowerCase()?.includes("disputed")
                      ? "Dispute Active"
                      : "Technician Status"}
                  </Text.Paragraph>

                  {item?.status?.toLowerCase()?.includes("disputed") ? (
                    <>
                      <Text.Paragraph className="!text-xs text-gray-400 mt-2">
                        Issue:{" "}
                        <span className="font-semibold">
                          {item?.dispute?.issue || "- -"}
                        </span>
                      </Text.Paragraph>
                      <Text.Paragraph className="!text-xs text-gray-400 mt-2">
                        Date Reported:{" "}
                        <span className="font-semibold">
                          {formatDateProper(
                            new Date(item?.dispute?.reportedAt)
                          ) || "- -"}
                        </span>
                      </Text.Paragraph>
                      <Text.Paragraph className="!text-xs text-gray-400 mt-2">
                        Original. completion:{" "}
                        <span className="font-semibold">
                          {formatDateProper(
                            new Date(item?.dispute?.originalCompletion)
                          ) || "- -"}{" "}
                        </span>
                      </Text.Paragraph>
                      <Text.Paragraph className="text-xs text-gray-400 mt-2">
                        {item?.dispute?.reason || ""}
                      </Text.Paragraph>
                    </>
                  ) : (
                    <>
                      <Text.Paragraph className="!text-xs text-gray-400 mt-2">
                        Arrived:
                      </Text.Paragraph>
                      <Text.Paragraph className="!text-xs text-gray-400 mt-2">
                        Work Started:
                      </Text.Paragraph>
                      <Text.Paragraph className="!text-xs text-gray-400 mt-2">
                        Est. completion:
                      </Text.Paragraph>
                      <Text.Paragraph className="text-xs text-gray-400 mt-2">
                        {item?.technicianStatus?.progressNote || ""}
                      </Text.Paragraph>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <Text.Paragraph
                    className={`${
                      item?.status?.toLowerCase()?.includes("disputed")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {item?.status?.toLowerCase()?.includes("disputed")
                      ? ""
                      : "Working"}
                  </Text.Paragraph>

                  <Text.Paragraph className="!text-xs font-bold mt-2">
                    {item?.technicianStatus?.arrived
                      ? formatTo12Hour(
                          new Date(item?.technicianStatus?.arrived)
                        )
                      : ""}
                  </Text.Paragraph>
                  <Text.Paragraph className="!text-xs font-bold mt-2">
                    {item?.technicianStatus?.workStarted
                      ? formatTo12Hour(
                          new Date(item?.technicianStatus?.workStarted)
                        )
                      : ""}
                  </Text.Paragraph>
                  <Text.Paragraph className="!text-xs font-bold mt-2">
                    {item?.technicianStatus?.estCompletion
                      ? formatTo12Hour(
                          new Date(item?.technicianStatus?.estCompletion)
                        )
                      : ""}
                  </Text.Paragraph>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </Box>
      ) : null} */}
    </SpecialBox>
  );
};
