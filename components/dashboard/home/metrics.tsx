"use client";

import { dummyMetrics } from "@/lib/dasboard-constatns";
import Box from "./box";
import Image from "next/image";
import Text from "@/components/ui/text";

const Metrics = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-2 xl:gap-4  ">
      {dummyMetrics.map((mtrc, i) => (
        <Box className="flex gap-4 items-center md:h-[142px]" key={i}>
          <div
            className="
            relative h-10 w-10 lg:h-7 lg:w-7 xl:h-10 xl:w-10 rounded-full
            flex items-center justify-center
            bg-light-300/70 hover:bg-light-300 active:bg-light-400
            transition-[background,transform,box-shadow] duration-200
            outline-none
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-light-500 focus-visible:ring-offset-light-main
          "
          >
            <Image
              src={mtrc.icon}
              className="xl:h-5 xl:w-5 h-5 w-5 md:h-4 md:w-4"
              alt="Icon"
            />
          </div>

          <div className="flex-col gap-2">
            <Text.SmallText className="text-xs lg:text-sm">
              {mtrc.name}
            </Text.SmallText>

            <Text.SmallHeading className="text-sm xl:text-base font-semibold">
              {mtrc.metric}
            </Text.SmallHeading>
          </div>
        </Box>
      ))}
    </div>
  );
};

export default Metrics;
