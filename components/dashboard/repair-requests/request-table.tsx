"use client";

import EmptyPage from "@/components/ui/empty";
import StatusCard from "@/components/ui/ststus-card";
import Text from "@/components/ui/text";
import { icons, images } from "@/lib/constants";
import { repTableH } from "@/lib/dasboard-constatns";
import { formatDateProper } from "@/lib/helpers";
import Image from "next/image";
import React, { useState } from "react";
import { FcCheckmark } from "react-icons/fc";
import TechModal from "./technician-modal";
import Dropdown from "@/components/ui/dropdown";
import { BsEye } from "react-icons/bs";
import { CgCloseO } from "react-icons/cg";
import { useToast } from "@/contexts/toast-contexts";
import { RequestCompletedToast } from "../home/request-submit-toast";
import { RepairJob } from "@/utils/types";
import { useSearchParams } from "next/navigation";

interface IProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

type DataType = {
  data: {
    id: string;
    service: string;
    technician: string;
    status: string;
    progress: string;
    contact: string;
  }[];
};

const RepairTable = ({ data }: { data: RepairJob[] }) => {
  const [check, setCheck] = useState(false);
  const [open, setOpen] = useState(false);
  const [tech, setTech] = useState<any>();
  const { warning } = useToast();
  const params = useSearchParams();
  const status = params.get("status");

  if (!data?.length)
    return (
      <EmptyPage
        tytle={`No ${status ? status : ""} Repair Requests`}
        message="Your repair activities appears here."
        className="min-h-[350px]"
      />
    );

  const handleOpenModal = (status: string) => {
    // const bg = status.toLowerCase()==='pending'
    warning({
      render: (api) => <RequestCompletedToast status={status} />,
      vars: { bg: "#ffffff", fg: "#72777A" }, // still can theme even with custom render
    });
  };

  return (
    <>
      <TableOverflow>
        <TechModal
          open={open}
          close={() => {
            setOpen(false);
            setTech(null);
          }}
          tech={tech}
        />
        <Table>
          <Thead>
            <Tr className="bg-light-480">
              {repTableH.map((rep) => (
                <Th
                  key={rep.id}
                  className={rep.size === "sm" ? "hidden md:table-cell" : ""}
                >
                  <div className="flex flex-row items-center gap-2 font-normal text-sm">
                    {rep.id === "1" ? (
                      <RadioCheck
                        checked={check}
                        setChecked={() => setCheck((ch) => !ch)}
                      />
                    ) : null}
                    <span>{rep.name}</span>
                  </div>
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((rep) => (
              <Tr key={rep.reference}>
                {/* Job ID (visible on mobile) */}
                <Td className="flex items-center gap-2">
                  <RadioCheck
                    checked={check}
                    setChecked={() => setCheck((ch) => !ch)}
                  />
                  <div>
                    <Text.SmallHeading className="text-sm font-semibold">
                      {rep.id}
                    </Text.SmallHeading>
                    <Text.SmallText>
                      {formatDateProper(new Date())}
                    </Text.SmallText>
                  </div>
                </Td>

                {/* Service (visible on mobile) */}
                <Td>{rep.category}</Td>

                {/* Technician (hide on mobile) */}
                <Td className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    {/* <Image
                      src={images.technician}
                      height={24}
                      width={24}
                      className="rounded-full "
                      alt="Technician"
                    /> */}

                    <span>
                      {rep?.status === "PENDING" ? "- -" : "TEchnicians name"}
                    </span>
                  </div>
                </Td>

                {/* Progress (hide on mobile) */}
                <Td className="hidden md:table-cell">
                  <Text.SmallText>
                    {rep?.status === "PENDING"
                      ? "Scheduling in Progress"
                      : rep?.status === "ONGOING"
                      ? "Awaiting Technician’s Arrival"
                      : rep?.status === "COMPLETED"
                      ? "Completed"
                      : "In dispute"}
                  </Text.SmallText>
                </Td>

                {/* Status (visible on mobile) */}
                <Td className="hidden md:table-cell">
                  <StatusCard status={rep.status.toUpperCase() as "ONGOING"} />
                </Td>

                {/* Actions (visible on mobile) */}
                <Td className="hidden md:table-cell">
                  <div className="flex items-center">
                    <button
                      className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer"
                      onClick={() => {
                        setOpen(true);
                        setTech(rep);
                      }}
                    >
                      <Image
                        src={icons.callIcon}
                        height={20}
                        width={20}
                        alt="Call icon"
                      />
                    </button>
                    <button
                      className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer"
                      onClick={() => {
                        setOpen(true);
                        setTech(rep);
                      }}
                    >
                      <Image
                        src={icons.chatIconActive2}
                        height={20}
                        width={20}
                        alt="Chat icon"
                      />
                    </button>
                  </div>
                </Td>

                {/* More (visible on mobile — part of actions) */}
                <Td>
                  <Dropdown className="">
                    <Dropdown.Trigger className="w-10 cursor-pointer" isNormal>
                      <Image
                        src={icons.moreIcon}
                        height={20}
                        width={24}
                        alt="Menu icon"
                      />
                    </Dropdown.Trigger>
                    <Dropdown.Content className="w-[120px] bg-white">
                      <Dropdown.Item
                        className="w-full"
                        onClick={() => handleOpenModal(rep.status)}
                      >
                        <div className="flex-rows items-center gap-2">
                          <BsEye />
                          <Text.Paragraph className="text-sm">
                            View Status
                          </Text.Paragraph>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item className="w-full">
                        <div className="flex-rows items-center gap-2">
                          <CgCloseO />
                          <Text.Paragraph className="text-sm">
                            Cancel
                          </Text.Paragraph>
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Content>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableOverflow>
    </>
  );
};

export const TableOverflow: React.FC<IProps> = ({ children, className }) => {
  return (
    <div className={`w-full overflow-x-auto h-full md:pb-20 ${className}`}>
      {children}
    </div>
  );
};

export const Table: React.FC<IProps> = ({ children }) => {
  return <table className="w-full text-left">{children}</table>;
};

export const Thead: React.FC<IProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

export const Tbody: React.FC<IProps> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const Th: React.FC<IProps> = ({ children, className }) => {
  return (
    <th className={`md:px-5 px-2 py-3 text-dark-150 ${className}`}>
      {children}
    </th>
  );
};

export const Tr: React.FC<IProps> = ({ children, className, onClick }) => {
  return (
    <tr className={className} onClick={onClick}>
      {children}
    </tr>
  );
};

export const Td: React.FC<IProps> = ({ children, className, onClick }) => {
  return (
    <td
      className={`md:px-5 sm:px-2 px-1 py-4 text-sm capitalize ${className}`}
      onClick={onClick}
    >
      {children}
    </td>
  );
};

export default RepairTable;

export const RadioCheck = ({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: () => void;
}) => {
  return (
    <button
      className="h-3.5 w-3.5 rounded-[2.6px] border border-gray-400 flex justify-center items-center"
      onClick={setChecked}
    >
      {checked ? <FcCheckmark size={12} /> : null}
    </button>
  );
};
