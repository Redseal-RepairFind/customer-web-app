"use client";

import { dashboard } from "@/lib/api/actions/dashboard-actions/dashboard/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useCompanyInspAvailability = () => {
  const srchParams = useSearchParams();
  const year = srchParams.get("year") || undefined;
  const monthStr = srchParams.get("month") || undefined;
  const month = monthStr ? parseInt(monthStr) : undefined;
  const {
    data: companyInspectionAvailability,
    isLoading: loadingCompanyInspectionAvailability,
    refetch: refetchCompanyInspectionAvailability,
    isRefetching: refetchingCompanyInspectionAvailability,
  } = useQuery({
    queryKey: ["company-Inspectionavailability"],
    queryFn: () =>
      dashboard.getCompanyInspectionAvailability({
        year,
        month,
      }),
  });

  return {
    companyInspectionAvailability,
    loadingCompanyInspectionAvailability,
    refetchCompanyInspectionAvailability,
    refetchingCompanyInspectionAvailability,
  };
};
