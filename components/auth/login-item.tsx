"use client";

import Link from "next/link";
import Text from "../ui/text";
import { InputContainer } from "./signup-item";
import Button from "../ui/custom-btn";
import AuthQuestion from "./question";
import Dropdown from "../ui/dropdown";
import { countries } from "@/lib/constants";
import Image from "next/image";
import { useState } from "react";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";

const LoginPage = () => {
  // const initCnt = countries[0];
  // const [language, setLanguage] = useState({
  //   flag: initCnt.flag,
  //   lang: initCnt.lang,
  // });

  const [showPassword, setShowPassword] = useState({
    pass: false,
    confirm: false,
  });

  const handleTogglePwd = (id: "pass" | "confirm") => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: !pass[id],
    }));
  };

  return (
    <div className="flex-col md:px-5 gap-10 w-full">
      {/* <div className="absolute top-0 right-0 w-[221px]">
        <Dropdown className="w-full">
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
      </div> */}
      <Text.Heading className="mb-12">Welcome Back!</Text.Heading>

      <div className="flex-col gap-12  ">
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">
            Email Address/Phone Number
          </Text.Paragraph>

          <InputContainer>
            <input
              type="text"
              className="text-input"
              placeholder="Enter email address"
            />
          </InputContainer>
        </div>
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">Password</Text.Paragraph>

          <InputContainer>
            <input
              type={showPassword.pass ? "text" : "password"}
              className="text-input"
              placeholder="Password"
            />

            <button
              type="button"
              className="cursor-pointer"
              onClick={() => handleTogglePwd("pass")}
            >
              {showPassword.pass ? <FaEye /> : <FaEyeSlash />}
            </button>
          </InputContainer>
        </div>

        <div className="flex-rows justify-end mb-4">
          <Link href={"/forgotPassword"}>
            <Text.Paragraph className="text-dark-500">
              Forgot Password
            </Text.Paragraph>
          </Link>
        </div>

        <Button className="cursor-pointer w-full mb-4">
          <Button.Text>Login</Button.Text>
        </Button>

        <AuthQuestion
          link="/signup"
          linkTxt="Create an Account"
          text="Don’t have an account?"
        />
      </div>
    </div>
  );
};

export default LoginPage;
