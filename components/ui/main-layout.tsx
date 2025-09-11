"use client";

import { usePageNavigator } from "@/hook/navigator";
import Footer from "./footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeRegistry from "@/contexts/theme-context";
import { useEffect } from "react";
import { generateToken, messaging } from "@/lib/firebase/firebase";
import { onMessage } from "firebase/messaging";
import { useToast } from "@/contexts/toast-contexts";
import Text from "./text";
import { dashboard } from "@/lib/api/actions/dashboard-actions/dashboard/dashboard";
import { useFCMNotifications } from "@/hook/useFcmToken";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { curPathname } = usePageNavigator();
  const { warning } = useToast();
  const isHome = curPathname === "/";
  const queryClient = new QueryClient();

  const isAuth =
    curPathname === "/login" ||
    curPathname === "/otp" ||
    curPathname === "/signup" ||
    curPathname === "/signup/info" ||
    curPathname === "/forgotPassword" ||
    curPathname === "/pricing" ||
    curPathname === "/resetPassword" ||
    curPathname === "/upgrade_subscription";

  useFCMNotifications();

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={`flex min-h-dvh flex-col border ${isHome ? "bg-black" : ""}`}
      >
        <main>
          <div
            className={` ${isHome || !isAuth ? "" : "px-2 md:px-4"} ${
              isHome || isAuth ? "lay-bg" : ""
            }`}
          >
            <ThemeRegistry>{children}</ThemeRegistry>
          </div>
        </main>

        {/* wrapper gives  the auto top margin that sticks it to the bottom when short */}
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </QueryClientProvider>
  );
}
