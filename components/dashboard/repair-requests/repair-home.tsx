"use client";

import DashboardHeader from "../header";
import FilterRepair from "./filter-status";
import RepairTable from "./request-table";
import { useRepairs } from "@/hook/useRepairs";
import LoadingTemplate from "@/components/ui/spinner";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/pagination";

const RepairRequestHome = () => {
  const { repairsData, loadingRepairs } = useRepairs();
  const searchParams = useSearchParams();

  if (loadingRepairs) return <LoadingTemplate />;

  const repairs = repairsData?.data?.data;
  const meta = repairsData?.data;
  // console.log(meta);

  const page = searchParams.get("page") || 1;
  const currentPage = Number(page);

  const metadata = {
    total: Number(meta?.totalItems),
    page: currentPage || Number(meta?.currentPage),
    totalPages: Number(meta?.lastPage),
    limit: Number(meta?.limit),
  };

  // console.log(metadata);

  return (
    <main className="w-full">
      <DashboardHeader />
      <section className="flex-cols gap-3 mt-5">
        <FilterRepair />

        <RepairTable data={repairs} />
      </section>
      <Pagination
        currentPage={metadata.page as number}
        totalPages={metadata.totalPages}
      />
    </main>
  );
};

export default RepairRequestHome;
