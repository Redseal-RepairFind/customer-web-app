import { dashboard } from "@/lib/api/actions/dashboard-actions/dashboard/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useSkills = () => {
  const { data: skills, isLoading: loadingSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: dashboard.getSkillTypes,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    // enabled: openModal, // only fetch when modal is open
  });

  return {
    skills,
    loadingSkills,
  };
};
