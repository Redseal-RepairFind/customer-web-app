import Text from "@/components/ui/text";
import { TableOverflow } from "../repair-requests/request-table";
import Box from "./box";
import StatusCard from "@/components/ui/ststus-card";
import Image from "next/image";
import { icons } from "@/lib/constants";
import Link from "next/link";
import Button from "@/components/ui/custom-btn";
import { BiEdit } from "react-icons/bi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { formatCurrency } from "@/lib/helpers";
import { Subscriptions } from "@/utils/types";
import { useSubCalc } from "@/hook/useSubCalc";
import { usePricing } from "@/hook/usePricing";
import LoadingTemplate from "@/components/ui/spinner";

const MultiBranch = () => {
  const {
    subscriptions,
    // status,
    // error,
    // fetchNextPage,
    // hasNextPage,
    // isFetchingNextPage,
    isFetching,

    // refetch,
  } = usePricing();

  if (isFetching) return <LoadingTemplate />;

  const first4 = subscriptions
    ?.filter((sub) => sub?.status !== "PENDING")
    ?.slice(0, 3);

  // console.log();

  return (
    <>
      {subscriptions?.length > 1 ? (
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
          <div className="grid md:grid-cols-2 gap-3 xl:grid-cols-3">
            {first4?.map((sub) => (
              <BranchCard key={sub?.id} item={sub} />
            ))}
          </div>

          <SeemoreBtn
            icon={icons.subIconActive}
            title="Manage all Branches"
            url="/manage-subscription"
          />
        </div>
      ) : null}
    </>
  );
};

export default MultiBranch;

export const SeemoreBtn = ({
  title,
  url,
  icon,
  className,
}: {
  title: string;
  url: string;
  icon?: any;
  className?: string;
}) => {
  return (
    <div className={`flex-row-center `}>
      <Link
        href={url}
        className={`py-2 px-3 rounded-lg border border-light-10 flex-rows gap-2 ${className}`}
      >
        {icon && <Image src={icon} height={20} width={20} alt="House icon" />}

        <Text.Paragraph>{title}</Text.Paragraph>
      </Link>
    </div>
  );
};

export const BranchCard = ({
  item,
  size,
  onOpenUpgrade,
}: {
  item: Subscriptions;
  size?: "full" | "";
  onOpenUpgrade?: (item: Subscriptions) => void;
}) => {
  const { daysLeft } = useSubCalc(item, item?.billingFrequency);

  // console.log(item);

  const jobSummary = item?.jobCounts;

  // console.log(item);
  const plan =
    typeof item?.planName === "string" ? item.planName : item?.planName?.[0];
  const basePlanName = plan ? plan.split(/\s*[-–—]\s*/)[0].trim() : "";

  // console.log(typeof item?.planName);

  return (
    <Box className="flex-cols gap-3">
      <div className="flex-row-between items-start gap-2 w-full">
        {/* <FaLocatio /> */}
        <div className="flex gap-2 items-start">
          <HiOutlineLocationMarker size={20} className="mt-1" />
          <div className="flex-cols gap-2">
            <Text.Paragraph className="font-bold">
              {item?.coverageAddress?.address}
            </Text.Paragraph>
            <Text.SmallText className="text-sm text-dark-500">
              {item?.coverageAddress?.country}
            </Text.SmallText>
          </div>
        </div>
        <div className="">
          <StatusCard
            status={
              item.status === "PENDING"
                ? "PENDING"
                : item.status === "CANCELED"
                ? "DISPUTED"
                : "COMPLETED"
            }
            name={
              item.status === "ACTIVE"
                ? "Active"
                : item?.status === "ONGOING"
                ? "Ongoing"
                : item?.status === "PENDING"
                ? "Pending"
                : "Inactive"
            }
          />
        </div>
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
          <Text.SmallText className="text-sm font-semibold">
            {formatCurrency(item?.remainingCredits || 0)}
          </Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm font-semibold">
            {jobSummary?.ongoing}
          </Text.SmallText>
        </div>
        <div>
          {" "}
          <Text.SmallText className="text-sm font-semibold">
            {jobSummary?.done}
          </Text.SmallText>
        </div>
      </div>

      {size === "full" ? (
        <>
          <div className="flex-row-between gap-2">
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-1">
              <Text.Paragraph className="text-sm text-dark-500">
                Plan Name:
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500 font-bold">
                {basePlanName || item?.planType}
              </Text.SmallText>
            </div>
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-1">
              <Text.Paragraph className="text-sm text-dark-500">
                Frequency:
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500 font-bold">
                {item?.billingFrequency}
              </Text.SmallText>
            </div>
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-1">
              <Text.Paragraph className="text-sm text-dark-500">
                Expires in:
              </Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500 font-bold">
                {daysLeft}d
              </Text.SmallText>
            </div>
          </div>
          {item?.status === "ACTIVE" ? (
            <Button variant="secondary" onClick={() => onOpenUpgrade?.(item)}>
              <Button.Icon>
                <BiEdit size={24} />
              </Button.Icon>
              <Button.Text>Manage</Button.Text>
            </Button>
          ) : item?.status === "PENDING" ? (
            <Button variant="secondary" onClick={() => onOpenUpgrade?.(item)}>
              {/* <Button.Icon>
                <BiEdit size={24} />
              </Button.Icon> */}
              <Button.Text>Continue</Button.Text>
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onOpenUpgrade?.(item)}>
              {/* <Button.Icon>
                <BiEdit size={24} />
              </Button.Icon> */}
              <Button.Text>Activate</Button.Text>
            </Button>
          )}
        </>
      ) : null}
    </Box>
  );
};
