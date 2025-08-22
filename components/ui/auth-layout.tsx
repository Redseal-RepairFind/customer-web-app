"use client";

import { useViewportHeight } from "@/hook/useViewportHeight";
import { images } from "@/lib/constants";
import Image from "next/image";

const Auth_Layout = ({ children }: { children: React.ReactNode }) => {
  const { height } = useViewportHeight();

  // console.log(height);

  const derivedHeight = Number(height) - 326;
  return (
    <div
      className="grid-2 pt-8 h-full relative mb-12"
      style={{
        minHeight: height ? `${derivedHeight}px` : "968px",
      }}
    >
      <div className="h-full hidden lg:flex">
        <div className="relative max-h-[968px] w-full  ">
          <Image src={images.landing} fill alt="Page" />
        </div>
      </div>
      <div className={`flex-col-center w-full min-h-dvh relative`}>
        {children}
      </div>
    </div>
  );
};

export default Auth_Layout;
