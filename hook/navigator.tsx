"use client";

import { usePathname, useRouter } from "next/navigation";

export const usePageNavigator = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navigator = {
    navigate: (route: string, type: "push" | "replace") => router[type](route),
  };

  return { navigator, curPathname: pathname };
};
