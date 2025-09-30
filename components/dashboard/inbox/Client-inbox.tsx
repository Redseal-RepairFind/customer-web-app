// app/dashboard/ClientInboxPage.tsx  (CLIENT COMPONENT)
"use client";

import dynamic from "next/dynamic";

// Only load Inbox in the browser
const Inbox = dynamic(() => import("@/components/dashboard/inbox/inbox"), {
  ssr: false,
});

export default function ClientInboxPage() {
  return <Inbox />;
}
