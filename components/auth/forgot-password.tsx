"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Button from "../ui/custom-btn";
import Text from "../ui/text";
import AuthQuestion from "./question";
import { InputContainer } from "./signup-item";
import { useEffect, useState } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { confirmPasswordCharacters } from "@/lib/helpers";
import { validations } from "@/lib/constants";
import { FcCancel } from "react-icons/fc";

const ForgPassword = () => {
  const [showPassword, setShowPassword] = useState({
    pass: false,
    confirm: false,
    password: "",
    confirmPassword: "",
  });

  const [passwordVerification, setPaswwordVerification] = useState({
    length: false,
    specialChar: false,
    validate: false,
    skip: true,
  });

  useEffect(() => {
    const confrm = confirmPasswordCharacters(showPassword.password);

    // console.log(confrm);

    setPaswwordVerification(confrm);
  }, [showPassword.password]);

  // console.log(passwordVerification);

  const handleTogglePwd = (id: "pass" | "confirm") => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: !pass[id],
    }));
  };
  const handlePwd = (id: "password" | "confirmPassword", text: string) => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: text,
    }));
  };
  return (
    <form className="flex-col md:px-5 gap-10 w-full">
      <div className="mb-12 flex-cols">
        <Text.Heading className="mb-2">Set New Password </Text.Heading>
        <Text.SmallText className="text-dark-400 text-[13px]">
          Choose appropriate account to create your account
        </Text.SmallText>
      </div>

      <div className="flex-col gap-4 mb-4">
        <Text.Paragraph className="font-semibold">Password</Text.Paragraph>

        <InputContainer>
          <input
            type={showPassword.pass ? "text" : "password"}
            className="text-input"
            placeholder="Password"
            onChange={(e) => handlePwd("password", e.target.value)}
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

      <div className="flex-col gap-4 mb-4">
        <Text.Paragraph className="font-semibold">
          Confirm Password
        </Text.Paragraph>

        <InputContainer>
          <input
            type={showPassword.confirm ? "text" : "password"}
            className="text-input"
            placeholder="Confirm Password"
            onChange={(e) => handlePwd("confirmPassword", e.target.value)}
          />

          <button
            type="button"
            className="cursor-pointer"
            onClick={() => handleTogglePwd("confirm")}
          >
            {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
          </button>
        </InputContainer>
      </div>

      <div className="">
        {validations.map((txt) => (
          <div className="flex-rows mb-2" key={txt.id}>
            <span className="mr-2">
              {passwordVerification.skip ? (
                <div className="h-4 w-4 rounded-full border" />
              ) : passwordVerification[txt.id as "length"] === true ? (
                <BiCheckCircle size={20} />
              ) : (
                <FcCancel size={20} />
              )}
            </span>

            <Text.SmallText
              className={`${
                passwordVerification.skip
                  ? "text-dark-500"
                  : passwordVerification[txt.id as "length"] === true
                  ? "text-dark"
                  : "text-red-500"
              }`}
            >
              {txt.name}
            </Text.SmallText>
          </div>
        ))}
        <div className="flex-rows mb-2">
          <span className="mr-2">
            {passwordVerification.skip ? (
              <div className="h-4 w-4 rounded-full border" />
            ) : showPassword.confirmPassword === showPassword.password &&
              showPassword.confirmPassword.length > 3 ? (
              <BiCheckCircle size={20} />
            ) : (
              <FcCancel size={20} />
            )}
          </span>

          <Text.SmallText
            className={`${
              passwordVerification.skip
                ? "text-dark-500"
                : showPassword.confirmPassword === showPassword.password &&
                  showPassword.confirmPassword.length > 3
                ? "text-dark"
                : "text-red-500"
            }`}
          >
            Passwords must match
          </Text.SmallText>
        </div>
      </div>
      <Button className="cursor-pointer w-full mt-8 mb-4">
        <Button.Text>Reset Password</Button.Text>
      </Button>

      <AuthQuestion link="/login" linkTxt="Sign in" text="Back to " />
    </form>
  );
};

export default ForgPassword;
