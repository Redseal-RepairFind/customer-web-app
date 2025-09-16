import Pricingg from "@/components/dashboard/pricing";
import { isToken } from "@/utils/isAuth";
// import { redirect } from "next/navigation";

// app/dashboard/page.tsx
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   description: "Select your Payment plans",
// };

const PricingPage = async () => {
  // const token = await isToken();

  // if (!token?.value) redirect("/login");
  // console.log(token);

  return <Pricingg isUpgrade={false} />;
};

export default PricingPage;
