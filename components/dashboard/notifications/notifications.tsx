"use client";

import Text from "@/components/ui/text";
import { useState } from "react";
import { PageToggler } from "../repair-requests/technician-modal";
import { PlanBadge } from "../home/plan-log";
import { SpecialBox } from "../home/job-toast-modal";
import { HiUser } from "react-icons/hi";
import Button from "@/components/ui/custom-btn";

const Notifs = () => {
  const [switched, setSwitched] = useState("Notifications");
  return (
    <main className="flex-cols gap-4">
      <div className="flex-row-between">
        <Text.SmallHeading>Notifications</Text.SmallHeading>

        <PlanBadge planName="3 unread" />
      </div>
      <PageToggler
        setSwitched={setSwitched}
        switched={switched}
        btn1="Notifications"
        btn2="Actions"
      />

      {switched.toLowerCase() === "notifications" ? (
        <div className="gap-2 flex-cols">
          <Text.SmallHeading>Recent Notification</Text.SmallHeading>

          <NotifItem />
        </div>
      ) : (
        <div className="gap-2 flex-cols">
          <Text.SmallHeading>Job Actions</Text.SmallHeading>
          <Text.SmallText className="text-sm text-dark-500 ">
            Track job requests received, accepted, and completed
          </Text.SmallText>
          <ActionsItem />
        </div>
      )}
    </main>
  );
};

export default Notifs;

const NotifItem = () => {
  return (
    <SpecialBox className="border border-dark-10 flex-row-between px-2 md:px-4 py-2">
      <div className="flex-rows gap-2 w-[80%]">
        <div className="h-8 min-w-8 rounded-full flex-row-center bg-red-100">
          <HiUser />
        </div>

        <div className="">
          <Text.SmallText className="text-sm md:text-base text-dark-500 font-semibold">
            Customer has viewed your site
          </Text.SmallText>

          <Text.SmallText className="text-xs md:text-sm text-dark-500 ">
            Customer has viewed your site visit request for a job on RepairFind.
            stay active and expect a response soon.{" "}
          </Text.SmallText>
        </div>
      </div>

      <div className=" ">
        <Text.SmallText className="text-xs md:text-sm text-dark-500 ">
          2 min ago
        </Text.SmallText>
      </div>
    </SpecialBox>
  );
};

const ActionsItem = () => {
  return (
    <SpecialBox className="border border-dark-10 flex-row-between px-2 md:px-4 py-2">
      <div className="flex items-start gap-2">
        <div className="h-8 min-w-8 rounded-full flex-row-center bg-red-100">
          <HiUser />
        </div>
        <div className="flex-cols gap-2">
          <Text.SmallText className="text-base text-dark-500 font-semibold">
            Customer has viewed your site
          </Text.SmallText>
          <Text.SmallText className="text-sm text-dark-500 ">
            Customer has viewed your site visit request for a job on RepairFind.
            stay active and expect a response soon.{" "}
          </Text.SmallText>

          <div>
            <Button>
              <Button.Text>Send Estimate</Button.Text>
            </Button>
          </div>
        </div>
      </div>

      <Text.SmallText className="text-sm text-dark-500 ">
        2 minutes ago
      </Text.SmallText>
    </SpecialBox>
  );
};
