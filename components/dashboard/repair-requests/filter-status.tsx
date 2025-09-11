"use client";

import Dropdown from "@/components/ui/dropdown";
import Text from "@/components/ui/text";
import { repairFilter } from "@/lib/dasboard-constatns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const FilterRepair = () => {
  const router = useRouter();

  const prm = useSearchParams();

  const status = prm.get("status") || "";

  const initStatus =
    repairFilter.find((st) => st.id.toLowerCase() === status) || null;

  const [filterItem, setFilterItem] = useState<{
    name: string;
    id: string;
  }>(initStatus);

  const clearParams = () => {
    // This will remove all query params and just keep the pathname
    router.push(window.location.pathname);
  };
  const updateStatus = (status: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("status", status);

    router.push(`?${searchParams.toString()}`);
  };
  return (
    <div className="flex-row-between gap-4">
      <Text.SmallHeading className="text-base font-semibold">
        Monitor Ongoing Requests
      </Text.SmallHeading>

      <Dropdown className="w-[156px]">
        <Dropdown.Trigger className="w-full flex-row-between cursor-pointer bg-light-450">
          <Text.Paragraph className="text-dark-500">
            {filterItem?.name || "All"}
          </Text.Paragraph>
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Label>Status</Dropdown.Label>
          <Dropdown.Item
            className="border-b border-b-dark-50"
            onClick={() => {
              clearParams();
              setFilterItem(null);
            }}
          >
            <Text.Paragraph className="text-dark-500">All</Text.Paragraph>
          </Dropdown.Item>
          {repairFilter?.map((fil) => (
            <Dropdown.Item
              key={fil?.id}
              onClick={() => {
                setFilterItem(fil);
                updateStatus(fil?.id?.toLowerCase());
              }}
              className="border-b border-b-dark-50"
            >
              <Text.Paragraph className="text-dark-500">
                {fil?.name}
              </Text.Paragraph>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};

export default FilterRepair;
