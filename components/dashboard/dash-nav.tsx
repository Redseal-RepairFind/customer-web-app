"use client";

import { dashboardNav, otherNav } from "@/lib/dasboard-constatns";
import RepairfindLogo from "../ui/logo";
import Text from "../ui/text";
import Link from "next/link";
import Image from "next/image";
import { usePageNavigator } from "@/hook/navigator";
import { icons } from "@/lib/constants";
import Button from "../ui/custom-btn";
import { useAuthentication } from "@/hook/useAuthentication";

const SIDEBAR_WIDTH = "w-[240px]";

const DashNav = () => {
  const { curPathname } = usePageNavigator();
  const { handleLogout } = useAuthentication();

  return (
    <aside
      className={`hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 ${SIDEBAR_WIDTH} z-[100] bg-black border-r`}
    >
      {/* Single scroll container that fills the full height */}
      <div className="h-full overflow-y-auto no-scrollbar p-4">
        <div className="mt-4">
          <RepairfindLogo nav type="link" />
        </div>

        <div className="mt-5">
          <Text.SmallText className="text-light-main text-xs">
            MAIN MENU
          </Text.SmallText>

          <div className="flex flex-col justify-between mt-4 min-h-[calc(100vh-7rem)]">
            <div className="flex flex-col gap-3">
              {dashboardNav.map((dash) => {
                const active = curPathname.includes(dash.route);
                return (
                  <Link
                    key={dash.route}
                    href={dash.route}
                    className={`flex flex-row items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                      active ? "bg-white" : "bg-transparent hover:bg-dark-600"
                    }`}
                  >
                    <span className="relative h-5 w-5">
                      <Image
                        src={active ? dash.activeIcon : dash.icon}
                        fill
                        alt="Icons"
                      />
                    </span>
                    <Text.SmallText
                      className={`text-sm ${
                        active ? "text-dark-main" : "text-light-main"
                      }`}
                    >
                      {dash.name}
                    </Text.SmallText>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Text.SmallText className="text-light-main text-xs uppercase">
                Others
              </Text.SmallText>
              {otherNav.map((dash) => {
                const active = curPathname === dash.route;
                if (dash.isLogout) {
                  return (
                    <button
                      key={dash.route}
                      onClick={() => handleLogout()}
                      className={`cursor-pointer flex flex-row items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                        active ? "bg-white" : "bg-transparent hover:bg-dark-600"
                      }`}
                    >
                      <span className="relative h-5 w-5">
                        <Image
                          src={active ? dash.activeIcon : dash.icon}
                          fill
                          alt="Icons"
                        />
                      </span>
                      <Text.SmallText
                        className={`text-sm ${
                          active ? "text-dark-main" : "text-light-main"
                        }`}
                      >
                        {dash.name}
                      </Text.SmallText>
                    </button>
                  );
                }

                return (
                  <Link
                    key={dash.route}
                    href={dash.route}
                    className={`flex flex-row items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                      active ? "bg-white" : "bg-transparent hover:bg-dark-600"
                    }`}
                  >
                    <span className="relative h-5 w-5">
                      <Image
                        src={active ? dash.activeIcon : dash.icon}
                        fill
                        alt="Icons"
                      />
                    </span>
                    <Text.SmallText
                      className={`text-sm ${
                        active ? "text-dark-main" : "text-light-main"
                      }`}
                    >
                      {dash.name}
                    </Text.SmallText>
                  </Link>
                );
              })}
              <div className="w-50 min-h-32 rounded-lg bg-light-main relative p-4 flex-col gap-4 ">
                <div className="absolute h-12 left-0 right-0 top-[-15px] flex justify-center">
                  <span className="h-8 w-8 rounded-full border-white bg-dark border flex items-center justify-center">
                    <Image
                      src={icons.chatIcon}
                      className="h-5 w-5"
                      alt="Chat icon"
                    />
                  </span>
                </div>

                <Text.Paragraph className="font-semibold text-center">
                  Contact RepairFind Team
                </Text.Paragraph>
                <Text.Paragraph className="text-center text-xs">
                  Reach our team to help with your questions
                </Text.Paragraph>

                <Button className="w-full mt-5">
                  <Button.Text>Contact us</Button.Text>
                </Button>
              </div>
              ;
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashNav;
