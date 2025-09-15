"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BsEye } from "react-icons/bs";
import { CgCloseO } from "react-icons/cg";
import Image from "next/image";
import { icons } from "@/lib/constants";
import Text from "@/components/ui/text";

export default function RepairDropdown({
  rep,
  handleViewEstimate,
  handleOpenModal,
  setOpenCompleted,
}: any) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-10 cursor-pointer flex items-center justify-center">
          <Image src={icons.moreIcon} height={20} width={24} alt="Menu icon" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="min-w-[160px] bg-white shadow-md rounded-lg p-2 z-50"
        align="end"
        sideOffset={6}
      >
        {!(
          rep?.contract?.isDraft ||
          rep.status === "EXPIRED" ||
          rep?.status === "PENDING" ||
          rep?.status === "CANCELED"
        ) && (
          <DropdownMenu.Item
            className="px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 focus:outline-none"
            onSelect={(e) => {
              e.preventDefault();
              handleViewEstimate(rep);
            }}
          >
            <div className="flex items-center gap-2">
              <BsEye />
              <Text.Paragraph className="text-sm">View Estimate</Text.Paragraph>
            </div>
          </DropdownMenu.Item>
        )}

        <DropdownMenu.Item
          className="px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 focus:outline-none"
          onSelect={(e) => {
            e.preventDefault();
            // handle cancel logic
          }}
        >
          <div className="flex items-center gap-2">
            <CgCloseO />
            <Text.Paragraph className="text-sm">Cancel</Text.Paragraph>
          </div>
        </DropdownMenu.Item>

        <DropdownMenu.Item
          className="px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-100 focus:outline-none"
          onSelect={(e) => {
            e.preventDefault();
            if (rep.status === "COMPLETED") {
              setOpenCompleted((cm: any) => ({
                ...cm,
                completed: true,
                jobInfo: rep,
              }));
            } else {
              handleOpenModal(rep.status);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <BsEye />
            <Text.Paragraph className="text-sm">View Status</Text.Paragraph>
          </div>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
