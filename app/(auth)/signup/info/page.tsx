import UserInformation from "@/components/auth/info";

// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer information", // will render as "Repairfind Premium Customer | Dashboard"
  description: "Customer details",
};

const Info = () => {
  return <UserInformation />;
};

export default Info;
