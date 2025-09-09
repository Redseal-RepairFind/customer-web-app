import Text from "@/components/ui/text";
import { TableOverflow } from "../repair-requests/request-table";
import Box from "./box";
import StatusCard from "@/components/ui/ststus-card";
import Image from "next/image";
import { icons } from "@/lib/constants";
import Link from "next/link";
import Button from "@/components/ui/custom-btn";
import { BiEdit } from "react-icons/bi";
import { FaLocationPin } from "react-icons/fa6";
import { HiOutlineLocationMarker } from "react-icons/hi";

const MultiBranch = () => {
  return (
    <div className="mt-8 flex-cols gap-2">
      <div className="flex-rows gap-2">
        <Image
          src={icons.subIconActive}
          height={20}
          width={20}
          alt="House icon"
        />

        <Text.SmallHeading>Multi-Branch Overview</Text.SmallHeading>
      </div>
      <TableOverflow className="grid-3">
        <BranchCard
          item={{
            country: "Canada",
            address: "Lafos ibadan expressway sulurele",
            status: "COMPLETED",
          }}
        />
      </TableOverflow>

      <div className="flex-row-center">
        <Link
          href="/manage-subscription"
          className="py-2 px-3 rounded-lg border border-light-10 flex-rows gap-2"
        >
          <Image
            src={icons.subIconActive}
            height={20}
            width={20}
            alt="House icon"
          />

          <Text.Paragraph>Manage all Branches</Text.Paragraph>
        </Link>
      </div>
    </div>
  );
};

export default MultiBranch;

export const BranchCard = ({
  item,
  size,
}: {
  item: {
    address: string;
    country: string;
    status: "ONGOING" | "PENDING" | "DISPUTE" | "COMPLETED";
    maintenanceCount?: number;
    eqAge?: string;
    plan?: string;
    expires?: string;
  };
  size?: "full" | "";
}) => {
  return (
    <Box className="flex-cols gap-3">
      <div className="flex-row-between items-start gap-2">
        {/* <FaLocatio /> */}
        <div className="flex gap-2 items-start">
          <HiOutlineLocationMarker size={20} className="mt-1" />
          <div className="flex-cols gap-2">
            <Text.Paragraph className="font-bold">
              {item.address}
            </Text.Paragraph>
            <Text.SmallText className="text-sm text-dark-500">
              {item?.country}
            </Text.SmallText>
          </div>
        </div>
        <StatusCard
          status={item.status}
          name={
            item.status === "COMPLETED"
              ? "Active"
              : item?.status === "ONGOING"
              ? "Ongoing"
              : item?.status === "PENDING"
              ? "Pending"
              : "Inactive"
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          {" "}
          <Text.SmallText className="text-sm text-dark-500">
            Available Credits
          </Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm text-dark-500">
            Ongoing
          </Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm text-dark-500">
            Done
          </Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm font-semibold">$34</Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm font-semibold">4</Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm font-semibold">30</Text.SmallText>
        </div>
      </div>

      {size === "full" ? (
        <>
          <div className="flex-row-between gap-2">
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-1">
              <Text.Paragraph className="text-sm text-dark-500">
                Plan:
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500 font-bold">
                {item?.plan}
              </Text.SmallText>
            </div>
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-1">
              <Text.Paragraph className="text-sm text-dark-500">
                Age of equipments:
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500 font-bold">
                {item?.eqAge}
              </Text.SmallText>
            </div>
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-1">
              <Text.Paragraph className="text-sm text-dark-500">
                Expires in:
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500 font-bold">
                {item?.expires}
              </Text.SmallText>
            </div>
          </div>

          <Button variant="secondary">
            <Button.Icon>
              <BiEdit size={24} />
            </Button.Icon>
            <Button.Text>Manage</Button.Text>
          </Button>
        </>
      ) : null}
    </Box>
  );
};
