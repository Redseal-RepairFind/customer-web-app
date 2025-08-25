"use client";

import { useState } from "react";
import Text from "../ui/text";
import ToggleBtn from "../ui/toggle-btn";
import PlacesAutocomplete from "../ui/places-autocomplete";
import Dropdown from "../ui/dropdown";
import { equipmentAge, plans } from "@/lib/constants";
import PricingItem from "./pricing-item";

const Pricingg = () => {
  const [toggle, setToggle] = useState(false);
  const [selectedPredictions, setSelectedPredictions] = useState<any>("");
  const [dropdown, setDropdown] = useState<any>();

  return (
    <main className="w-full">
      <div className="flex-col-center w-full mb-8">
        <Text.Heading className="text-xl lg:text-3xl text-center">
          RepairFind Subscription Plans
        </Text.Heading>
        <Text.Heading className="my-2 text-dark-400 text-xl lg:text-3xl text-center">
          We don’t sell repairs, we sells peace of mind
        </Text.Heading>

        <div className="flex items-center justify-center gap-2 text-dark-400 ">
          <Text.Paragraph className="text-dark-400 text-sm lg:text-base text-nowrap">
            Billed monthly
          </Text.Paragraph>

          <ToggleBtn toggle={toggle} onClick={() => setToggle((tg) => !tg)} />

          <Text.Paragraph className="text-green-500 text-sm lg:text-base">
            Bill annually
            {"  "}
            <span className="font-semibold sm:ml-1">
              (Save one month, sign up annually, pay up front)
            </span>
          </Text.Paragraph>
        </div>
      </div>

      <div className="flex-col gap-4 mb-4 ">
        <div className="flex-rows mb-2">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            Home Address{" "}
            <span className="font-light text-xs sm:ml-1">
              (This is the address that will be linked to your subscription)
            </span>
          </Text.Paragraph>

          <Text.SmallText className="text-dark-100 text-xs"></Text.SmallText>
        </div>

        <PlacesAutocomplete
          selectedPredictions={selectedPredictions}
          setSelectedPredictions={setSelectedPredictions}
          // modal
        />
      </div>
      <div className="flex-col gap-4 mb-4">
        <div className="flex-rows mb-2">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            Age of Equipment{" "}
            <span className="font-light text-xs sm:ml-1">
              {" "}
              (Providing false information about your equipment’s age will void
              your RepairFind subscription)
            </span>
          </Text.Paragraph>
        </div>
        <Dropdown className="w-full">
          <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
            <Text.Paragraph className="text-dark-500">
              {dropdown?.name || "Select Equipment Age"}
            </Text.Paragraph>
          </Dropdown.Trigger>
          <Dropdown.Content className="w-full bg-white">
            <Dropdown.Label>
              <Text.Paragraph className="text-dark-500">
                {dropdown?.name || "Select Equipment Age"}
              </Text.Paragraph>
            </Dropdown.Label>

            {equipmentAge.map((eq, i) => (
              <Dropdown.Item
                key={eq.id}
                className={` ${
                  i === equipmentAge?.length - 1
                    ? ""
                    : "border-b border-b-light-100"
                } `}
                onClick={() => setDropdown(eq)}
              >
                <Text.Paragraph className="text-dark-500">
                  {eq.name}
                </Text.Paragraph>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div>

      <div className="grid-3 w-full">
        {plans.map((pla, i) => (
          <PricingItem
            isRecommended={i === 0}
            item={pla as any}
            key={i}
            cycle={toggle ? "monthly" : "yearly"}
          />
        ))}
      </div>
    </main>
  );
};

export default Pricingg;
