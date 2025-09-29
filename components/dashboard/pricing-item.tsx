"use client";
import { BiCheck } from "react-icons/bi";
import Text from "../ui/text";
import { useState } from "react";
import { CgChevronDown, CgChevronUp } from "react-icons/cg";
import { formatCurrency } from "@/lib/helpers";

const PricingItem = ({
  isRecommended,
  item,
  cycle,
  blurItems,
  onSelectPlan,
}: {
  item: any;
  isRecommended: boolean;
  cycle: "monthly" | "yearly";
  blurItems: string[];
  onSelectPlan: (item: any) => void;
  currentPlan?: boolean;
}) => {
  console.log(item);
  // return null;
  const [showall, setShowall] = useState(false);
  const feats = showall ? item?.features : item?.features.slice(0, 5) || [];

  return (
    <div
      className={`bg-light-200 p-6 w-full rounded-lg border  ${
        blurItems?.includes(item?._id)
          ? "blur-xs pointer-events-none select-none border-dark-400"
          : "border-purple-200"
      }`}
    >
      <div className="flex-row-between mb-2">
        <Text.Paragraph className="font-bold">
          {item?.name.split(" - ")[0]}
        </Text.Paragraph>
        {/* {isRecommended ? (
          <span className=" px-3 py-2 rounded-full text-base text-white bg-black">
            {"Recommended"}
          </span>
        ) : null} */}
      </div>

      <span className="flex  gap-2 mb-1">
        {item?.billingFrequency === "ANNUALLY" ? (
          <Text.SubHeading className="text-red-500 line-through text-sm font-semibold">
            {formatCurrency(item?.priceDetails?.basePrice || "")}
          </Text.SubHeading>
        ) : null}
        <Text.Heading className="xl:font-black font-black lg:text-lg md:font-black">
          {formatCurrency(item?.priceDetails?.discountedPrice)}
        </Text.Heading>
        <Text.SmallText className="font-semibold text-xs">+GST</Text.SmallText>

        <Text.SubHeading className="text-sm font-semibold">
          /{cycle}
        </Text.SubHeading>
      </span>

      <Text.Paragraph className="text-dark-500 mb-2">
        {item.target}
      </Text.Paragraph>

      <button
        className="h-10 w-full flex-row-center rounded-lg bg-purple-blue-100 mb-5 cursor-pointer hover:bg-black hover:text-white transition-all duration-300"
        onClick={() => onSelectPlan(item)}
      >
        <Text.Paragraph className="font-semibold">
          Choose {item?.name.split(" - ")[0]}
        </Text.Paragraph>
      </button>

      {feats?.map((feat: any, i: number) => {
        // const splitedText = feat?;

        return (
          <div className="flex gap-2 items-start mt-2" key={i}>
            <div className="h-4 w-4 rounded-sm border flex items-center justify-center border-dark-600 mt-1">
              {feat?.status === "INCLUDED" ? <BiCheck size={14} /> : null}
            </div>

            <Text.Paragraph className="text-dark-400 text-base">
              {feat.name}
              {"  "}
              <span className="text-xs font-light sm:ml-1">
                {feat.description}
              </span>
            </Text.Paragraph>
          </div>
        );
      })}
      {/* {showall
        ? item?.benefits.map((feat, i) => {
            const splitedText = feat?.split(" - ");
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
        : null} */}

      {item?.feat > 5 && (
        <div
          className="flex-row-center w-full mt-10"
          onClick={() => setShowall((sh) => !sh)}
        >
          <button className="flex-rows gap-3 cursor-pointer">
            <Text.SmallText>
              {showall ? "See less Features" : "See more features"}
            </Text.SmallText>

            {showall ? <CgChevronUp /> : <CgChevronDown />}
          </button>
        </div>
      )}
    </div>
  );
};
export default PricingItem;
