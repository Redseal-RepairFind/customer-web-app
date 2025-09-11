"use client";

import Text from "../ui/text";
import { InputContainer } from "./signup-item";
import Button from "../ui/custom-btn";

import { useState } from "react";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useAuthentication } from "@/hook/useAuthentication";
import { useForm } from "react-hook-form";
import LoadingTemplate from "../ui/spinner";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState({
    pass: false,
    confirm: false,
  });

  const {
    formState: { errors },
    register,
    handleSubmit,
    watch,
  } = useForm();
  const { handleResetPassword, verifying } = useAuthentication();

  const handleTogglePwd = (id: "pass" | "confirm") => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: !pass[id],
    }));
  };

  const passwordValue = watch("password");

  // console.log(timezone);

  return (
    <div className="flex-col md:px-5 gap-10 w-full">
      <Text.Heading className="mb-12">Reset Password</Text.Heading>

      <form
        className="flex-col gap-12"
        onSubmit={handleSubmit(handleResetPassword)}
      >
        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">Password</Text.Paragraph>

          <InputContainer>
            <input
              type={showPassword.pass ? "text" : "password"}
              className="text-input"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                  message:
                    "Password must contain at least one uppercase, one number, and one special character",
                },
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

        <div className="flex-col gap-4 mb-4">
          <Text.Paragraph className="font-semibold">
            Confirm Password
          </Text.Paragraph>

          <InputContainer>
            <input
              type={showPassword.confirm ? "text" : "password"}
              className="text-input"
              placeholder="Confirm password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === passwordValue || "Passwords do not match",
              })}
            />

            <button
              type="button"
              className="cursor-pointer"
              onClick={() => handleTogglePwd("confirm")}
            >
              {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
            </button>
          </InputContainer>

          {errors?.confirmPassword?.message && (
            <Text.SmallText className="text-red-500">
              {errors?.confirmPassword?.message.toString()}
            </Text.SmallText>
          )}
        </div>

        <Button
          className="cursor-pointer w-full mb-4 mt-8 min-h-12 relative"
          disabled={verifying}
          type="submit"
        >
          {verifying ? (
            <LoadingTemplate isMessage={false} variant="small" />
          ) : (
            <Button.Text>Save Changes</Button.Text>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
