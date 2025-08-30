"use client";

import { useViewportHeight } from "@/hook/useViewportHeight";
import { countries, images } from "@/lib/constants";
import Image from "next/image";
import Dropdown from "./dropdown";
import Text from "./text";
import { useState } from "react";
import RepairfindLogo from "./logo";
import { usePageNavigator } from "@/hook/navigator";

const Auth_Layout = ({ children }: { children: React.ReactNode }) => {
  const { height } = useViewportHeight();
  const { curPathname } = usePageNavigator();
  const initCnt = countries[0];
  const [language, setLanguage] = useState({
    flag: initCnt.flag,
    lang: initCnt.lang,
  });
  // console.log(curPathname);

  // const derivedHeight = Number(height) - 326;

  return (
    <div
      className="grid lg:grid-cols-2  items-center pt-4 lg:min-h-[900px] relative mb-12 px-3 lg:mt-8"
      // style={{
      //   minHeight: height ? `968px` : "968px",
      // }}
    >
      <div className="h-full hidden lg:flex lg:items-center">
        <div className="relative h-[968px] w-full  ">
          <Image src={images.landing} fill alt="Page" />
        </div>
      </div>
      <div className={`flex-col-center w-full min-h-dvh relative`}>
        <div className="absolute top-0 left-0 right-0 flex-row-between">
          <div className="hidden lg:flex"></div>
          <div className="lg:hidden flex">
            <RepairfindLogo />
          </div>
          {curPathname.includes("login") ? (
            <Dropdown className="w-[221px]">
              <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
                <span className="flex-rows">
                  <span className="rounded-full h-6 w-6 relative mr-2">
                    <Image
                      src={language.flag}
                      alt="Flags"
                      fill
                      className="rounded-full"
                    />
                  </span>
                  <Text.Paragraph className="text-dark-500">
                    {language.lang}
                  </Text.Paragraph>
                </span>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <Dropdown.Label>Languages</Dropdown.Label>
                {countries.map((cnt, i) => (
                  <Dropdown.Item
                    key={cnt.name}
                    className={`flex-rows ${
                      i === countries?.length - 1
                        ? ""
                        : "border-b border-b-light-100"
                    } `}
                    onClick={() => setLanguage(cnt)}
                  >
                    <span className="rounded-full h-6 w-6 relative mr-2">
                      <Image
                        src={cnt.flag}
                        alt="Flags"
                        fill
                        className="rounded-full"
                      />
                    </span>
                    <Text.Paragraph className="text-dark-500">
                      {cnt.lang}
                    </Text.Paragraph>
                  </Dropdown.Item>
                ))}
              </Dropdown.Content>
            </Dropdown>
          ) : null}
        </div>

        <div
          className={`w-full ${
            curPathname === "/signup/info" ? "mt-24 lg:mt-0" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Auth_Layout;
