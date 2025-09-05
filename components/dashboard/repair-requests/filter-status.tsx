"use client";

import Dropdown from "@/components/ui/dropdown";
import Text from "@/components/ui/text";

const FilterRepair = () => {
  return (
    <div className="flex-row-between gap-4">
      <Text.SmallHeading className="text-base font-semibold">
        Monitor Ongoing Requests
      </Text.SmallHeading>

      <Dropdown className="w-[156px]">
        <Dropdown.Trigger className="w-full flex-row-between cursor-pointer bg-light-450">
          <Text.Paragraph className="text-dark-500">Status</Text.Paragraph>
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Label>Status</Dropdown.Label>
          {/* <Dropdown.Item>Item</Dropdown.Item> */}
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};

export default FilterRepair;
