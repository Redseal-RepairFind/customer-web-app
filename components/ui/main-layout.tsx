"use client";

import { usePageNavigator } from "@/hook/navigator";
import Footer from "./footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { curPathname } = usePageNavigator();

  const isHome = curPathname === "/";

  const isAuth =
    curPathname === "/login" ||
    curPathname === "/otp" ||
    curPathname === "/signup" ||
    curPathname === "/forgotPassword";
  return (
    <div
      className={`flex min-h-dvh flex-col border ${isHome ? "bg-black" : ""}`}
    >
      <main>
        <div
          className={` ${isHome || !isAuth ? "" : "px-2 md:px-4"} ${
            isHome || isAuth ? "lay-bg" : ""
          }`}
        >
          {children}
        </div>
      </main>

      {/* wrapper gives the auto top margin that sticks it to the bottom when short */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
