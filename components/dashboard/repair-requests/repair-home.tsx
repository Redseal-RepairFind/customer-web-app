import EmptyPage from "@/components/ui/empty";
import DashboardHeader from "../header";
import FilterRepair from "./filter-status";
import RepairTable from "./request-table";
import { repairTable } from "@/lib/dasboard-constatns";
import { Rating } from "@/components/ui/rating";

const RepairRequestHome = () => {
  return (
    <main className="w-full">
      <DashboardHeader />
      <section className="flex-cols gap-3 mt-5">
        <FilterRepair />

        <RepairTable data={[]} />
      </section>
    </main>
  );
};

export default RepairRequestHome;
