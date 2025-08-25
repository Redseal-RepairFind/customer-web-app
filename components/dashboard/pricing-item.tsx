"use client";
import { BiCheck } from "react-icons/bi";
import Text from "../ui/text";
import { useState } from "react";
import { CgChevronUp } from "react-icons/cg";
import { formatCurrency } from "@/lib/helpers";

const PricingItem = ({
  isRecommended,
  item,
  cycle,
}: {
  item: {
    name: string;
    billingCycle: {
      monthly: {
        price: number;
        cycle: string;
      };
      yearly: {
        price: number;
        slashed: number;
        cycle: string;
      };
    };
    target: string;
    features: string[];
    benefits: string[];
  };
  isRecommended: boolean;
  cycle: "monthly" | "yearly";
}) => {
  const [showall, setShowall] = useState(false);
  const feats = showall ? item.features : item.features.slice(0, 5);

  return (
    <div className="bg-light-200 p-6 w-full rounded-lg border border-purple-200">
      <div className="flex-row-between mb-2">
        <Text.Paragraph className="font-bold">{item.name}</Text.Paragraph>
        {isRecommended ? (
          <span className=" px-3 py-2 rounded-full text-base text-white bg-black">
            Recommended
          </span>
        ) : null}
      </div>

      <span className="flex-rows gap-2 mb-1">
        {cycle === "yearly" ? (
          <Text.SubHeading className="text-red-500 font-semibold line-through">
            {formatCurrency(item.billingCycle.yearly.slashed)}
          </Text.SubHeading>
        ) : null}
        <Text.Heading className="font-black">
          {formatCurrency(item.billingCycle[cycle as "monthly"].price)}
        </Text.Heading>

        <Text.SubHeading>/{cycle}</Text.SubHeading>
      </span>

      <Text.Paragraph className="text-dark-500 mb-2">
        {item.target}
      </Text.Paragraph>

      <button className="h-10 w-full flex-row-center rounded-lg bg-purple-blue-100 mb-5">
        <Text.Paragraph className="font-semibold">
          Choose {item.name}
        </Text.Paragraph>
      </button>

      {feats.map((feat, i) => {
        const splitedText = feat.split(" - ");

        return (
          <div className="flex gap-2 items-start mt-2" key={i}>
            <BiCheck />

            <Text.Paragraph className="text-dark-400 text-xl">
              {splitedText[0]}
              {"  "}
              <span className="text-sm font-light sm:ml-1">
                {splitedText[1]}
              </span>
            </Text.Paragraph>
          </div>
        );
      })}
      {showall
        ? item?.benefits.map((feat, i) => {
            const splitedText = feat.split(" - ");
            return (
              <div className="flex gap-2 items-start mt-2" key={i}>
                <BiCheck />

                <Text.Paragraph className="text-dark-400 text-xl">
                  {splitedText[0]}
                  {"  "}
                  <span className="text-sm font-light sm:ml-1">
                    {splitedText[1]}
                  </span>
                </Text.Paragraph>
              </div>
            );
          })
        : null}

      <div
        className="flex-row-center w-full mt-10"
        onClick={() => setShowall((sh) => !sh)}
      >
        <button className="flex-rows gap-3 cursor-pointer">
          <Text.SmallText>
            {showall ? "See less Features" : "See more features"}
          </Text.SmallText>

          <CgChevronUp />
        </button>
      </div>
    </div>
  );
};
export default PricingItem;
