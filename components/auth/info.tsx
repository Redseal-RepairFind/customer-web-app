"use client";

import {
  accountType,
  businessAcctType,
  countries,
  icons,
  residentialAcctType,
} from "@/lib/constants";
import { useSearchParams } from "next/navigation";
import Text from "../ui/text";
import { InputContainer } from "./signup-item";
import Image from "next/image";
import Dropdown from "../ui/dropdown";
import { useState } from "react";
import Button from "../ui/custom-btn";
import AuthQuestion from "./question";
import PlacesAutocomplete from "../ui/places-autocomplete";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import HoverTooltip from "../ui/tool-tip";

const UserInformation = () => {
  const params = useSearchParams();
  const field = params.get("type");
  const [dropdown, setDropdown] = useState<any>();
  const [showPassword, setShowPassword] = useState({
    pass: false,
    confirm: false,
  });
  const initPlan = accountType?.find((acct) => acct.id === field);
  const [selectedPlan, setselectedPlan] = useState(initPlan);
  const [selectedPredictions, setSelectedPredictions] = useState<any>("");
  const fieldsInput = field?.toUpperCase()?.includes("RESIDENTIAL")
    ? residentialAcctType
    : businessAcctType;

  const handleTogglePwd = (id: "pass" | "confirm") => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: !pass[id],
    }));
  };

  return (
    <div className="flex-col md:px-5 gap-10 w-full">
      <Text.Heading className="mb-5">
        Create a RepairFinder account
      </Text.Heading>

      {fieldsInput.map((inps) =>
        inps.type === "input" ? (
          <div className="flex-col gap-4 mb-2" key={inps.id}>
            <div className="flex-rows">
              <Text.Paragraph className="font-semibold mr-2">
                {inps.title}
              </Text.Paragraph>
              {inps.notice ? (
                <HoverTooltip content="Providing false information about your equipment’s age will void your RepairFind subscription.">
                  <button type="button" className="h-4 w-4 relative">
                    <Image src={icons.infoIcon} alt="Info icon" fill />
                  </button>
                </HoverTooltip>
              ) : null}
            </div>

            <InputContainer>
              <input
                type={
                  inps.id === "password"
                    ? showPassword.pass
                      ? "text"
                      : "password"
                    : inps.id === "confirmPassword"
                    ? showPassword.confirm
                      ? "text"
                      : "password"
                    : inps.inputType
                }
                className="text-input"
                placeholder={inps.placeHolder}
              />

              {inps.icon ? (
                <button
                  className="h-5 w-5 relative cursor-pointer"
                  onClick={() =>
                    inps.id.toLowerCase().includes("password")
                      ? handleTogglePwd(
                          inps.id === "password" ? "pass" : "confirm"
                        )
                      : () => {}
                  }
                  type="button"
                >
                  {inps.id === "password" ? (
                    showPassword.pass ? (
                      <FaEye />
                    ) : (
                      <FaEyeSlash />
                    )
                  ) : inps.id === "confirmPassword" ? (
                    showPassword.confirm ? (
                      <FaEye />
                    ) : (
                      <FaEyeSlash />
                    )
                  ) : (
                    <Image src={inps.icon} fill alt="Icons" />
                  )}
                </button>
              ) : null}
            </InputContainer>
          </div>
        ) : (
          <div className="flex-col gap-4 mb-4" key={inps.id}>
            <div className="flex-rows">
              <Text.Paragraph className="font-semibold mr-2">
                {inps.title}
              </Text.Paragraph>

              {inps.notice ? (
                <HoverTooltip
                  content={
                    inps.id === "homeAddress"
                      ? "This is the address that will be linked to your subscription"
                      : "Providing false information about your equipment’s age will void your RepairFind subscription."
                  }
                >
                  <button
                    type="button"
                    className="h-4 w-4 relative cursor-pointer"
                  >
                    <Image src={icons.infoIcon} alt="Info icon" fill />
                  </button>
                </HoverTooltip>
              ) : null}
            </div>
            {inps.id === "homeAddress" ? (
              <PlacesAutocomplete
                selectedPredictions={selectedPredictions}
                setSelectedPredictions={setSelectedPredictions}
                // modal
              />
            ) : (
              <Dropdown className="w-full">
                <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
                  <Text.Paragraph className="text-dark-500">
                    {inps.id === "acctType"
                      ? selectedPlan?.name
                      : dropdown?.name || "Select Equipment Age"}
                  </Text.Paragraph>
                </Dropdown.Trigger>
                <Dropdown.Content className="w-full bg-white">
                  <Dropdown.Label>
                    <Text.Paragraph className="text-dark-500">
                      Select
                    </Text.Paragraph>
                  </Dropdown.Label>
                  {inps?.list.map((cnt, i) => (
                    <Dropdown.Item
                      key={cnt.name}
                      className={` ${
                        i === countries?.length - 1
                          ? ""
                          : "border-b border-b-light-100"
                      } `}
                      onClick={() =>
                        inps.id ? setselectedPlan(cnt) : setDropdown(cnt)
                      }
                    >
                      <Text.Paragraph className="text-dark-500">
                        {cnt.name}
                      </Text.Paragraph>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Content>
              </Dropdown>
            )}
          </div>
        )
      )}

      <Button
        className="cursor-pointer w-full mb-4 mt-8"
        // onClick={() => router.push(`/signup/info?type=${selectedPlan.id}`)}
      >
        <Button.Text>Create Account</Button.Text>
      </Button>

      <div className="">
        <AuthQuestion link="/login" linkTxt="Log in" text="Have an account?" />
      </div>
    </div>
  );
};

export default UserInformation;
