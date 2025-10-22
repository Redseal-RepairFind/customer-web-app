"use client";

import dynamic from "next/dynamic";

const Notifications = dynamic(() => import("./notifications"), { ssr: false });

const ClientNotis = () => {
  return <Notifications />;
};

export default ClientNotis;
