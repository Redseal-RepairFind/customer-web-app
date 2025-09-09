"use client";

import Text from "@/components/ui/text";
import Box from "./box";
import StatusCard from "@/components/ui/ststus-card";
import { useToast } from "@/contexts/toast-contexts";
import {
  CompletedToast,
  JobCompletedModal,
  JobDisputeModal,
  JobRatingModal,
} from "./job-toast-modal";
import Modal from "@/components/ui/customModal";
import { useState } from "react";

const recReq = [
  {
    name: "Plumbing - Kitchen",
    date: "Aug 5, 2025",
    status: "ONGOING",
    id: "#12345",
  },
  {
    name: "Electrical - Living Room",
    date: "Aug 20, 2025",
    status: "COMPLETED",
    id: "#123456",
  },
  {
    name: "HVAC - Bedroom",
    date: "Aug 16, 2025",
    status: "DISPUTE",
    id: "#1234567",
  },
];

const RecentRequests = () => {
  const { warning } = useToast();
  const [openModals, setOpenModals] = useState({
    completed: true,
    rating: false,
    report: false,
  });

  const handleModal = (
    action: "open" | "close",
    variant: "completed" | "rating" | "report"
  ) => {
    if (action === "open") {
      setOpenModals((op) => ({
        completed: false,
        rating: false,
        report: false,
        [variant]: true,
      }));
    } else {
      setOpenModals((op) => ({
        ...op,
        [variant]: false, // Close the specified variant
      }));
    }
  };

  return (
    <>
      <Modal
        onClose={() => handleModal("close", "completed")}
        isOpen={openModals.completed}
        maxWidth="max-w-[539px]"
      >
        <JobCompletedModal
          onReport={() => handleModal("open", "report")}
          onReview={() => handleModal("open", "rating")}
          onClose={() => handleModal("close", "completed")}
          jobInfo={{
            name: "Mike Johnson",
            ratings: 4.9,
            category: "Electrical",
            jobsCompleted: 100,
            date: new Date(),
            summary: "Installed new electrical components",
          }}
        />
      </Modal>
      <Modal
        onClose={() => handleModal("close", "rating")}
        isOpen={openModals.rating}
        maxWidth="max-w-[539px]"
      >
        <JobRatingModal
          onReview={() => {}}
          onClose={() => handleModal("close", "rating")}
          jobInfo={{
            name: "Mike Johnson",
            ratings: 4.9,
            category: "Electrical",
            jobsCompleted: 100,
            date: new Date(),
            summary: "Installed new electrical components",
          }}
        />
      </Modal>

      <Modal
        onClose={() => handleModal("close", "report")}
        isOpen={openModals.report}
        maxWidth="max-w-[539px]"
      >
        <JobDisputeModal
          onClose={() => handleModal("close", "report")}
          onReport={() => {}}
        />
      </Modal>
      <div className="flex-cols gap-4">
        <Text.SmallHeading>Recent Requests</Text.SmallHeading>

        {recReq.map((req) => (
          <button
            key={req.id}
            className="cursor-pointer"
            onClick={() => {
              if (req.status === "COMPLETED") {
                warning({
                  render: (api) => (
                    <CompletedToast
                      onOpenRating={() => handleModal("open", "rating")}
                    />
                  ),
                  vars: { bg: "#E7FFEC", fg: "#28A745" }, // still can theme even with custom render
                });
              }
            }}
          >
            <Box className="flex-row-between p-4" key={req.id}>
              <div className="flex-cols gap-1">
                <Text.SubHeading className="text-xl  font-semibold">
                  {req.name}
                </Text.SubHeading>

                <Text.Paragraph className="text-dark-100 text-sm">
                  {req.id} - {req.date}
                </Text.Paragraph>
              </div>

              <StatusCard status={req.status as "ONGOING"} />
            </Box>
          </button>
        ))}
      </div>
    </>
  );
};

export default RecentRequests;
