"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";

export type ActionItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onSelect?: (e: Event | React.SyntheticEvent) => void;
  hidden?: boolean;
  disabled?: boolean;
  danger?: boolean; // style helper
};

export type ActionDropdownProps = {
  items: ActionItem[];
  trigger: React.ReactNode;
  sideOffset?: number;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
};

export default function ActionDropdown({
  items,
  trigger,
  sideOffset = 6,
  align = "end",
  className = "",
  contentClassName = "",
}: ActionDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className={className}>{trigger}</div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align={align}
        sideOffset={sideOffset}
        className={
          contentClassName ||
          "min-w-[180px] bg-white shadow-md rounded-lg p-2 z-50 border border-gray-100"
        }
      >
        {items
          .filter((it) => !it.hidden)
          .map((it) => (
            <DropdownMenu.Item
              key={it.key}
              disabled={it.disabled}
              onSelect={(e) => {
                e.preventDefault();
                it.onSelect?.(e);
              }}
              className={[
                "px-3 py-2 rounded-md text-sm cursor-pointer focus:outline-none",
                "hover:bg-gray-100 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
                it.danger ? "text-red-600 hover:bg-red-50" : "text-gray-800",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                {it.icon}
                <span className="text-sm leading-tight">{it.label}</span>
              </div>
            </DropdownMenu.Item>
          ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
