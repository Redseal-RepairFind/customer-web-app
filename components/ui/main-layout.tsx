"use client";

import { usePageNavigator } from "@/hook/navigator";
import Footer from "./footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeRegistry from "@/contexts/theme-context";

import { SocketProvider } from "@/contexts/socket-contexts";
import { NotificationSoundProvider } from "@/contexts/sound-provider";
import GeneralLayout from "./genera-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { curPathname } = usePageNavigator();
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
            <NotificationSoundProvider>
              <GeneralLayout>
                <SocketProvider>
                  <>
                    <ThemeRegistry>{children}</ThemeRegistry>
                  </>
                </SocketProvider>
              </GeneralLayout>
            </NotificationSoundProvider>
          </div>
        </main>

        {/* wrapper gives  the auto top margin that sticks it to the bottom when short */}
        {/* <div className="mt-auto">
          <Footer />
        </div> */}
      </div>
    </QueryClientProvider>
  );
}
