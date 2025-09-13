"use client";

import EmptyPage from "@/components/ui/empty";
import StatusCard from "@/components/ui/ststus-card";
import Text from "@/components/ui/text";
import { icons, images } from "@/lib/constants";
import { repTableH } from "@/lib/dasboard-constatns";
import { formatDateProper, getProgress } from "@/lib/helpers";
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
import Modal from "@/components/ui/customModal";
import Estimate from "./estimate-modal";
import { useRepairs } from "@/hook/useRepairs";
import LoadingTemplate from "@/components/ui/spinner";
import Button from "@/components/ui/custom-btn";
import { ClipLoader } from "react-spinners";
import { useSocket } from "@/contexts/socket-contexts";
import {
  JobCompletedModal,
  JobDisputeModal,
  JobRatingModal,
} from "../home/job-toast-modal";

interface IProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const RepairTable = ({ data }: { data: RepairJob[] }) => {
  const [check, setCheck] = useState(false);
  const [open, setOpen] = useState(false);
  const [tech, setTech] = useState<any>();
  const { warning } = useToast();

  const [openCompleted, setOpenCompleted] = useState({
    jobInfo: null,
    completed: false,
    review: false,
    dispute: false,
  });

  const params = useSearchParams();
  const status = params.get("status");
  const [openModal, setOpenModal] = useState({
    estimate: null,
    open: false,
    openPayments: false,
  });
  const [methodId, setMethodId] = useState<{
    card: any;
    id: string;
  }>();

  const { openComplete, setOpenComplete } = useSocket();
  const {
    paymentMethods,
    loadingPaymentMethods,
    creatingRequest,
    handlePayEstimate,
  } = useRepairs();

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

  console.log(data);

  const handleViewEstimate = (estimate: RepairJob | null) => {
    setOpenModal({
      open: true,
      estimate,
      openPayments: false,
    });
  };

  const handleUnViewEstimate = () => {
    setOpenModal((est) => ({
      ...est,
      open: false,
      openPayments: false,
    }));
  };
  const handleViewMethods = () => {
    setOpenModal((est) => ({
      ...est,
      open: false,
      openPayments: true,
    }));
  };

  const handleCloseMethods = () => {
    setOpenModal((est) => ({
      ...est,
      open: false,
      openPayments: false,
      estimate: null,
    }));
  };
  // lib/statusProgress.ts

  if (loadingPaymentMethods) return <LoadingTemplate />;

  // console.log(methodId);
  const mthods = paymentMethods?.data;

  // console.log(data);

  return (
    <>
      <Modal onClose={handleUnViewEstimate} isOpen={openModal.open}>
        <Estimate
          estimate={openModal.estimate || data[0]}
          closeModal={handleUnViewEstimate}
          openPayment={handleViewMethods}
        />
      </Modal>

      <Modal onClose={handleCloseMethods} isOpen={openModal.openPayments}>
        <div className="flex-cols gap-4 h-[200px]">
          <Text.Paragraph className="font-semibold text-base">
            Select payment method
          </Text.Paragraph>
          <Dropdown className="">
            <Dropdown.Trigger className="flex-row-between">
              <Text.Paragraph className="text-sm">
                {methodId
                  ? `${methodId?.card?.brand} **** **** **** ${methodId?.card?.last4}`
                  : " Select Payment method"}
              </Text.Paragraph>
            </Dropdown.Trigger>
            <Dropdown.Content className=" bg-white ">
              {mthods?.map((mt: { card: any; id: string }) => (
                <Dropdown.Item
                  className="w-full border-b border-b-light-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMethodId(mt);
                  }}
                  key={mt?.id}
                >
                  <Text.SmallText>
                    {mt?.card?.brand} **** **** **** {mt?.card?.last4}
                  </Text.SmallText>
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown>
          <Button
            onClick={() =>
              handlePayEstimate({
                jobId: openModal.estimate._id,
                quotesId: openModal.estimate?.contract?._id,
                paymentId: methodId?.id,
                close: () => handleCloseMethods(),
              })
            }
          >
            <Button.Icon>
              {creatingRequest ? (
                <ClipLoader size={20} color="#fff" />
              ) : (
                <Image src={icons.card} alt="" height={20} width={20} />
              )}
            </Button.Icon>
            <Button.Text>
              {creatingRequest ? "Authorizing...." : "Proceed"}
            </Button.Text>
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={openCompleted.completed}
        onClose={() =>
          setOpenCompleted((cm) => ({
            ...cm,
            completed: false,
          }))
        }
      >
        <JobCompletedModal
          jobInfo={openCompleted.jobInfo}
          onReport={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              dispute: true,
              completed: false,
            }))
          }
          onReview={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              review: true,
              completed: false,
            }))
          }
          onClose={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              completed: false,
            }))
          }
        />
      </Modal>
      <Modal
        isOpen={openCompleted.review}
        onClose={() =>
          setOpenCompleted((cm) => ({
            ...cm,
            review: false,
          }))
        }
      >
        <JobRatingModal
          jobInfo={openCompleted.jobInfo}
          // onReport={() =>
          //   setOpenCompleted((cm) => ({
          //     ...cm,
          //     dispute: false,
          //   }))
          // }
          onReview={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              review: false,
            }))
          }
          onClose={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              review: false,
            }))
          }
        />
      </Modal>
      <Modal
        isOpen={openCompleted.dispute}
        onClose={() =>
          setOpenCompleted((cm) => ({
            ...cm,
            dispute: false,
          }))
        }
      >
        <JobDisputeModal
          // jobInfo={openCompleted.dispute}
          onReport={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              dispute: false,
            }))
          }
          // onReview={() =>
          //   setOpenCompleted((cm) => ({
          //     ...cm,
          //     review: false,
          //   }))
          // }
          onClose={() =>
            setOpenCompleted((cm) => ({
              ...cm,
              dispute: false,
            }))
          }
          disputeInfo={openCompleted.jobInfo}
        />
      </Modal>
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
              <Tr key={rep.jobId}>
                {/* Job ID (visible on mobile) */}
                <Td className="flex items-center gap-2">
                  <RadioCheck
                    checked={check}
                    setChecked={() => setCheck((ch) => !ch)}
                  />
                  <div>
                    <Text.SmallHeading className="text-sm font-semibold">
                      {rep.jobId}
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
                  {rep.contractors?.length ? (
                    <div className="flex items-center gap-2">
                      <Image
                        src={rep?.contractors[0]?.profilePhoto}
                        height={24}
                        width={24}
                        className="rounded-full "
                        alt="Technician"
                      />

                      <Text.Paragraph className="text-xs">
                        {rep?.contractors[0]?.firstName}{" "}
                        {rep?.contractors[0]?.lastName}
                      </Text.Paragraph>
                    </div>
                  ) : (
                    <p>- -</p>
                  )}
                </Td>

                {/* Progress (hide on mobile) */}
                <Td className="hidden md:table-cell">
                  <Text.SmallText>{getProgress(rep.status)}</Text.SmallText>
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
                <Td className="relative ">
                  <Dropdown className="absolute -left-5 flex-cols items-end">
                    <Dropdown.Trigger className="w-10 cursor-pointer " isNormal>
                      <Image
                        src={icons.moreIcon}
                        height={20}
                        width={24}
                        alt="Menu icon"
                      />
                    </Dropdown.Trigger>
                    <Dropdown.Content className="w-[120px] bg-white absolute -left-5">
                      {rep?.contract?.isDraft ||
                      rep.status === "EXPIRED" ||
                      rep?.status === "PENDING" ||
                      rep?.status === "CANCELED" ? null : (
                        <Dropdown.Item
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            // handleOpenModal(rep.status);
                            handleViewEstimate(rep);
                          }}
                        >
                          <div className="flex-rows items-center gap-2">
                            {/* <BsEye /> */}
                            <Text.Paragraph className="text-sm">
                              View Estimate
                            </Text.Paragraph>
                          </div>
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="flex-rows items-center gap-2">
                          {/* <CgCloseO /> */}
                          <Text.Paragraph className="text-sm">
                            Cancel
                          </Text.Paragraph>
                        </div>
                      </Dropdown.Item>

                      <Dropdown.Item
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          rep.status === "COMPLETED"
                            ? setOpenCompleted((cm) => ({
                                ...cm,
                                completed: true,
                                jobInfo: rep,
                              }))
                            : handleOpenModal(rep.status);
                        }}
                      >
                        <div className="flex-rows items-center gap-2">
                          {/* <BsEye /> */}
                          <Text.Paragraph className="text-sm">
                            View Status
                          </Text.Paragraph>
                        </div>
                      </Dropdown.Item>
                      {/* {rep.status === "COMPLETED" && (
                        <>
                          <Dropdown.Item
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();

                              setOpenCompleted((cm) => ({
                                ...cm,
                                completed: true,
                                jobInfo: rep,
                              }));
                            }}
                          >
                            <div className="flex-rows items-center gap-2">
                              <Text.Paragraph className="text-sm">
                                Rate Job
                              </Text.Paragraph>
                            </div>
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(rep.status);
                            }}
                          >
                            <div className="flex-rows items-center gap-2">
                              <Text.Paragraph className="text-sm">
                                View Status
                              </Text.Paragraph>
                            </div>
                          </Dropdown.Item>
                        </>
                      )} */}
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
