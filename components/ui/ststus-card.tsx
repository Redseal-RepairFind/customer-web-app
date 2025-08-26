"use client";

import Text from "./text";

const StatusCard = ({
  status,
  className,
}: {
  status: "ONGOING" | "COMPLETED" | "DISPUTE";
  className?: string;
}) => {
  return (
    <div
      className={`${className} py-2 px-5 flex items-center justify-center rounded-full text-light-main ${
        status === "ONGOING"
          ? "bg-yellow-500"
          : status === "COMPLETED"
          ? "bg-green-500"
          : "bg-red-500"
      } min-w-[114px] `}
    >
      <Text.SmallText className="capitalize">
        {status.toLowerCase()}
      </Text.SmallText>
    </div>
  );
};

export default StatusCard;
