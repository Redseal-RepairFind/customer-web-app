"use client";

import Text from "@/components/ui/text";
import Box from "./box";
import StatusCard from "@/components/ui/ststus-card";

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
  return (
    <div className="flex-cols gap-4">
      <Text.SmallHeading>Recent Requests</Text.SmallHeading>

      {recReq.map((req) => (
        <Box className="flex-row-between p-4" key={req.id}>
          <div className="flex-cols gap-1">
            <Text.SubHeading className="text-xl md:text-2xl font-semibold">
              {req.name}
            </Text.SubHeading>

            <Text.Paragraph className="text-dark-100 text-sm">
              {req.id} - {req.date}
            </Text.Paragraph>
          </div>

          <StatusCard status={req.status as "ONGOING"} />
        </Box>
      ))}
    </div>
  );
};

export default RecentRequests;
