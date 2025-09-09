"use client";

import Link from "next/link";
import Text from "../ui/text";
import { InputContainer } from "./signup-item";
import Button from "../ui/custom-btn";
import AuthQuestion from "./question";

import { useState } from "react";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useAuthentication } from "@/hook/useAuthentication";
import { useForm } from "react-hook-form";
import LoadingTemplate from "../ui/spinner";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState({
    pass: false,
    confirm: false,
  });

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm();
  const { handleUserLogin, verifying } = useAuthentication();

  const handleTogglePwd = (id: "pass" | "confirm") => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: !pass[id],
    }));
  };

  // console.log(timezone);

  return (
    <div className="flex-col md:px-5 gap-10 w-full">
      <Text.Heading className="mb-12">Welcome Back!</Text.Heading>

      <form
        className="flex-col gap-12"
        onSubmit={handleSubmit(handleUserLogin)}
      >
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">
            Email Address
          </Text.Paragraph>

          <InputContainer>
            <input
              type="text"
              className="text-input"
              placeholder="Enter email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
          </InputContainer>

          {errors?.email?.message && (
            <Text.SmallText className="text-red-500">
              {errors?.email?.message.toString()}
            </Text.SmallText>
          )}
        </div>
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">Password</Text.Paragraph>

          <InputContainer>
            <input
              type={showPassword.pass ? "text" : "password"}
              className="text-input"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
              })}
            />

            <button
              type="button"
              className="cursor-pointer"
              onClick={() => handleTogglePwd("pass")}
            >
              {showPassword.pass ? <FaEye /> : <FaEyeSlash />}
            </button>
          </InputContainer>

          {errors?.password?.message && (
            <Text.SmallText className="text-red-500">
              {errors?.password?.message.toString()}
            </Text.SmallText>
          )}
        </div>

        <div className="flex-rows justify-end mb-4">
          <Link href={"/forgotPassword"}>
            <Text.Paragraph className="text-dark-500">
              Forgot Password
            </Text.Paragraph>
          </Link>
        </div>

        <Button
          className="cursor-pointer w-full mb-4 mt-8 min-h-12 relative"
          disabled={verifying}
          type="submit"
        >
          {verifying ? (
            <LoadingTemplate isMessage={false} variant="small" />
          ) : (
            <Button.Text>Login</Button.Text>
          )}
        </Button>
        <AuthQuestion
          link="/signup"
          linkTxt="Create an Account"
          text="Don’t have an account?"
        />
      </form>
    </div>
  );
};

export default LoginPage;
