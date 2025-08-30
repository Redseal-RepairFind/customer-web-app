import { pricingActions } from "@/lib/api/actions/dashboard-actions/pricing/pricing-action";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePageNavigator } from "./navigator";

export const useUser = () => {
  const { navigator } = usePageNavigator();
  const {
    data: curUser,
    isLoading: loadingCurUser,
    refetch: refetchingCurUser,
    isRefetching: isRefetchingCurUser,
  } = useQuery<any>({
    queryKey: ["cur-user"],
    queryFn: pricingActions.getMe,
  });

  console.log(curUser);

  useEffect(() => {
    // equipmentAgeCategory;
    // console.log(curUser?.data?.subscription?.planId);

    const plan = curUser?.data?.subscription;
    if (
      curUser &&
      !plan?.equipmentAgeCategory.toLowerCase().includes("unknown") &&
      !plan?.planId
    )
      navigator.navigate("/pricing", "replace");
  }, [curUser]);

  return {
    isRefetchingCurUser,
    loadingCurUser,
    curUser,
    refetchingCurUser,
  };
};
