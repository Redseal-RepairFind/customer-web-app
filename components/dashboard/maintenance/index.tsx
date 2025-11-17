"use client";

import Text from "@/components/ui/text";
import MaintenanceMetrics from "./maintenance-metrics";
import { PageToggler } from "../repair-requests/technician-modal";
import { icons } from "@/lib/constants";
import { useState } from "react";
import { MaintenanceTable, UpcomingMaintenanceTable } from "./table-alert";
import { useMaintenanceInfinite } from "@/hook/useMaintenance";
import LoadingTemplate from "@/components/ui/spinner";
import { RepairJob } from "@/utils/repairtype";
import EmptyPage from "@/components/ui/empty";
const togglers = [
  {
    label: "Upcoming Maintenance",
    value: "Upcoming",
    badgeCount: 0,
    icon: icons.calendarIcon,
  },
  {
    label: "Maintenance History",
    value: "history",
    badgeCount: 0,
    icon: icons.clockIcon,
  },
];

const MaintenanceLog = () => {
  const [switched, setSwitched] = useState<any>(togglers[0]);
  const {
    items,
    isLoading,
    isError,
    error,
    loadMoreRef,
    hasNextPage,
    isFetchingNextPage,
  } = useMaintenanceInfinite({ syncPageToUrl: false });

  if (isLoading) return <LoadingTemplate />;
  // if (isError)
  //   return <div className="p-4 text-red-600">Error: {String(error)}</div>;

  // console.log(items);

  if (items?.length === 0)
    return (
      <div className="h-screen">
        <EmptyPage
          tytle="No Inspection or Maintenance activity to show"
          message="You have No Inspection or Maintenance activity to showt"
        />
      </div>
    );
  return (
    <main className="flex flex-col gap-5">
      <div>
        <Text.SmallHeading>Maintenance Log</Text.SmallHeading>
        <Text.SmallText className="text-dark-500 text-xs">
          Track completed maintenance and schedule upcoming services
        </Text.SmallText>
      </div>
      <MaintenanceMetrics />
      <PageToggler
        setSwitched={(s) => setSwitched(s)}
        switched={switched}
        btns={togglers}
      />

      {switched?.value === "Upcoming" || switched === "Upcoming" ? (
        <UpcomingMaintenanceTable items={items} />
      ) : (
        <MaintenanceTable items={items} />
      )}

      <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
        {hasNextPage ? (
          <span className="text-sm text-gray-500">
            {isFetchingNextPage ? "Loading more…" : "Scroll to load more"}
          </span>
        ) : null}
      </div>
    </main>
  );
};

export default MaintenanceLog;
