"use client";

import { dashboardNav, otherNav } from "@/lib/dasboard-constatns";
import RepairfindLogo from "../ui/logo";
import Text from "../ui/text";
import Link from "next/link";
import Image from "next/image";
import { usePageNavigator } from "@/hook/navigator";
import { icons, images } from "@/lib/constants";
import Button from "../ui/custom-btn";
import { useAuthentication } from "@/hook/useAuthentication";

const DashNav = () => {
  const { curPathname } = usePageNavigator();
  const { handleLogout } = useAuthentication();

  return (
    <aside className="hidden lg:block border-r bg-black  overflow-y-hidden relative z-[100] w-[240px]">
      <div className="fixed top-0 h-screen overflow-y-auto no-scrollbar p-4 bg-black">
        <div className="mt-4">
          <RepairfindLogo nav type="link" />
        </div>

        <div className="mt-5 h-full overflow-y-hidden">
          <Text.SmallText className="text-light-main text-xs ">
            MAIN MENU
          </Text.SmallText>

          <div className="flex-col flex justify-between  h-[750px] mt-4 overflow-y-hidden w-full">
            <div className="flex-cols gap-3 ">
              {dashboardNav.map((dash) => (
                <Link
                  className={`${
                    curPathname.includes(dash.route)
                      ? "bg-white"
                      : "bg-transparent hover:bg-dark-600"
                  } flex-rows py-2 px-3 rounded-lg gap-2    transition-all duration-300`}
                  key={dash.route}
                  href={dash.route}
                >
                  <span className="h-5 w-5 relative">
                    <Image
                      src={
                        curPathname.includes(dash.route)
                          ? dash.activeIcon
                          : dash.icon
                      }
                      fill
                      alt="Icons"
                    />
                  </span>
                  <Text.SmallText
                    className={`${
                      curPathname.includes(dash.route)
                        ? "text-dark-main"
                        : "text-light-main"
                    } text-sm`}
                  >
                    {dash.name}
                  </Text.SmallText>

                  {/* {dash.name.toLowerCase().includes("inbox") ||
                  dash.name.toLowerCase().includes("log") ? (
                    <Badge isActive count={20} />
                  ) : null} */}
                </Link>
              ))}
            </div>

            <div className="flex-cols gap-3">
              <Text.SmallText className="text-light-main text-xs uppercase">
                Others
              </Text.SmallText>
              {otherNav.map((dash) => {
                if (dash.isLogout)
                  return (
                    <button
                      className={`${
                        curPathname === dash.route
                          ? "bg-white"
                          : "bg-transparent"
                      }  cursor-pointer flex-rows py-2 px-3 rounded-lg gap-2 hover:bg-dark-600  transition-all duration-300`}
                      onClick={dash.isLogout ? () => handleLogout() : () => {}}
                      key={dash.route}
                    >
                      <span className="h-5 w-5 relative">
                        <Image
                          src={
                            curPathname === dash.route
                              ? dash.activeIcon
                              : dash.icon
                          }
                          fill
                          alt="Icons"
                        />
                      </span>
                      <Text.SmallText
                        className={`${
                          curPathname === dash.route
                            ? "text-dark-main"
                            : "text-light-main"
                        } text-sm`}
                      >
                        {dash.name}
                      </Text.SmallText>
                    </button>
                  );
                return (
                  <Link
                    className={`${
                      curPathname === dash.route ? "bg-white" : "bg-transparent"
                    } flex-rows py-2 px-3 rounded-lg gap-2 hover:bg-dark-600  transition-all duration-300`}
                    key={dash.route}
                    href={dash?.isLogout ? "" : dash.route}
                    onClick={dash.isLogout ? () => handleLogout() : () => {}}
                  >
                    <span className="h-5 w-5 relative">
                      <Image
                        src={
                          curPathname === dash.route
                            ? dash.activeIcon
                            : dash.icon
                        }
                        fill
                        alt="Icons"
                      />
                    </span>
                    <Text.SmallText
                      className={`${
                        curPathname === dash.route
                          ? "text-dark-main"
                          : "text-light-main"
                      } text-sm`}
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
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashNav;
