import { dashboard } from "@/lib/api/actions/dashboard-actions/dashboard/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useDashboard = () => {
  const {
    data: trxSummary,
    isLoading: isLoadingTrxSummary,
    refetch: refechTrxSummary,
    isRefetching: isRefetchingTransactionSummary,
  } = useQuery({
    queryKey: ["transaction-summary"],
    queryFn: dashboard.getTransactionSummary,
  });

  return {
    trxSummary,
    isLoadingTrxSummary,
    refechTrxSummary,
    isRefetchingTransactionSummary,
  };
};
