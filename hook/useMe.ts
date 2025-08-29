import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const {
    data: curUser,
    isLoading: loadingCurUser,
    refetch: refetchingCurUser,
    isRefetching: isRefetchingCurUser,
  } = useQuery<any>({
    queryKey: ["cur-user"],
    queryFn: pricingActions.getMe,
  });

  return {
    isRefetchingCurUser,
    loadingCurUser,
    curUser,
    refetchingCurUser,
  };
};
