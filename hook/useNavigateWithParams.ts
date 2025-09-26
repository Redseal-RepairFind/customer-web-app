import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const useNavigateWithParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Navigate while merging new params with existing ones
   */
  const navigate = (
    path: string,
    newParams: Record<string, string | undefined | null>
  ) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    // Merge newParams
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${path}?${queryString}` : path;

    router.push(url);
  };

  return { navigate };
};
