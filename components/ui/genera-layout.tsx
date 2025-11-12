"use client";

import { useFCMNotifications } from "@/hook/useFcmToken";

const GeneralLayout = ({ children }: { children: React.ReactNode }) => {
  useFCMNotifications();

  return <div className="general-layout">{children}</div>;
};

export default GeneralLayout;
