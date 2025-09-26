// app/dashboard/page.tsx
import Inbox from "@/components/dashboard/inbox/inbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbox", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Your Conversations",
};

const InboxHome = () => {
  return <Inbox />;
};

export default InboxHome;
