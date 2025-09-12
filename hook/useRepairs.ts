import { repairActions } from "@/lib/api/actions/dashboard-actions/repair-actions/repair";
import { formatError } from "@/lib/helpers";
import { RepairType } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const useRepairs = () => {
  const [creatingRequest, setCreatingRequest] = useState(false);
  const params = useSearchParams();

  const page = params.get("page") || "1";
  const limit = params.get("limit") || "10";
  const status =
    params?.get("status") ||
    "BOOKED,ONGOING,COMPLETED,DISPUTED,CANCELED,EXPIRED,COMPLETED_SITE_VISIT,PENDING";

  const {
    data: repairsData,
    isLoading: loadingRepairs,
    refetch: refetchRepairs,
  } = useQuery({
    queryKey: ["fetch-repairs", page, limit, status],
    queryFn: () =>
      repairActions.fetchRepairRequest({
        page: Number(page),
        limit: Number(limit),
        type: "REPAIR",
        status: status?.toUpperCase(),
      }),
    refetchOnWindowFocus: false,
  });

  const handleCreateRequest = async (data: RepairType, close: () => void) => {
    if (!data?.description) {
      toast.error("Please provide a description of the repair needed.");
      return;
    }
    if (!data?.serviceType) {
      toast.error("Please provide a service type.");
      return;
    }
    if (!data?.subscriptionId) {
      toast.error(
        "Please select your subscription plan for issue locatiion identification."
      );
      return;
    }

    setCreatingRequest(true);
    try {
      const res = await repairActions.createRepairRequest(data);
      toast.success(res?.message || "Repair request created successfully");

      close();
      await refetchRepairs();
      return res;
    } catch (error: any) {
      const err = formatError(error) || "An error occurred. Please try again.";
      console.error("Create request error", error);
      toast.error(err);
    } finally {
      setCreatingRequest(false);
    }
  };
  return {
    creatingRequest,
    handleCreateRequest,
    repairsData,
    loadingRepairs,
    refetchRepairs,
  };
};
