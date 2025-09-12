"use client";

import Text from "./text";

const StatusCard = ({
  status,
  className,
  name,
}: {
  status:
    | "BOOKED"
    | "ONGOING"
    | "COMPLETED"
    | "DISPUTED"
    | "CANCELED"
    | "REFUNDED"
    | "EXPIRED"
    | "PENDING";
  className?: string;
  name?: string;
}) => {
  return (
    <div
      className={`${className} py-2 px-2 md:px-5 flex items-center justify-center rounded-full text-light-main ${
        status === "ONGOING" || status === "BOOKED"
          ? "bg-yellow-500"
          : status === "COMPLETED"
          ? "bg-green-500"
          : status === "PENDING" || status === "EXPIRED"
          ? "bg-dark-200"
          : "bg-red-500"
      } max-w-[114px] `}
    >
      <Text.SmallText className="capitalize">
        {name || status.toLowerCase()}
      </Text.SmallText>
    </div>
  );
};

export default StatusCard;
