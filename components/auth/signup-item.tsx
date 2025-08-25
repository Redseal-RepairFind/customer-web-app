"use client";

import { accountType } from "@/lib/constants";
import Text from "../ui/text";
import Image from "next/image";
import { useState } from "react";
import Button from "../ui/custom-btn";
import AuthQuestion from "./question";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const initPlan = accountType[0];
  const [selectedPlan, setselectedPlan] = useState(initPlan);
  const router = useRouter();

  return (
    <div className="flex-col md:px-5 gap-10 w-full">
      <div className="mb-12 flex-cols">
        <Text.Heading className="mb-2">
          Create a RepairFinder account
        </Text.Heading>
        <Text.SmallText className="text-dark-400 text-[13px]">
          Choose appropriate account type to create your account
        </Text.SmallText>
      </div>

      {accountType.map((acct) => (
        <button
          className="select-container cursor-pointer mb-4"
          key={acct.id}
          onClick={() => setselectedPlan(acct)}
        >
          <div className="flex-rows">
            <div className="flex-rows mr-4">
              <BoxModel variant={acct.variant as "green"}>
                <div className="h-5 w-5 relative">
                  <Image src={acct.icon} alt="Subscription icon" />
                </div>
              </BoxModel>
            </div>

            <div className="flex flex-col items-start">
              <Text.SubHeading className="mb-2 text-start">
                {acct.name}
              </Text.SubHeading>
              <Text.SmallText className="text-dark-400 text-[13px] text-start">
                {acct.tag}
              </Text.SmallText>
            </div>
          </div>

          <div
            className={`bg-light-main min-h-6 min-w-6 rounded-full ${
              selectedPlan.id === acct.id ? "border-8" : "border border-light-0"
            } `}
          />
        </button>
      ))}

      <Button
        className="cursor-pointer w-full mb-4 mt-8"
        onClick={() => router.push(`/signup/info?type=${selectedPlan.id}`)}
      >
        <Button.Text>Proceed</Button.Text>
      </Button>

      <AuthQuestion link="/login" linkTxt="Log in" text="Have an account?" />
    </div>
  );
};

export default SignupPage;

export const InputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="input-container flex-rows">{children}</div>;
};

const BoxModel = ({
  variant,
  children,
}: {
  variant: "green" | "black";
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`flex-col-center p-2 h-11 w-11 rounded-lg ${
        variant === "black" ? "bg-dark" : "bg-green-100"
      }`}
    >
      {children}
    </div>
  );
};
