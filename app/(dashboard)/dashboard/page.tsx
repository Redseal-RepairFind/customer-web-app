import DashboardHome from "@/components/dashboard/home/dash-home";
// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard overview",
};

const Home = () => {
  return <DashboardHome />;
};

export default Home;
