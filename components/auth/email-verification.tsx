"use client";

import { usePageNavigator } from "@/hook/navigator";
import Button from "../ui/custom-btn";
import Text from "../ui/text";
import AuthQuestion from "./question";
import { InputContainer } from "./signup-item";
import { useAuthentication } from "@/hook/useAuthentication";
import LoadingTemplate from "../ui/spinner";
import { useForm } from "react-hook-form";

const EmailVerification = () => {
  const { handleForgotPassword, verifying } = useAuthentication();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form
      className="flex-col md:px-5 gap-10 w-full"
      onSubmit={handleSubmit(handleForgotPassword)}
    >
      <div className="mb-12 flex-cols">
        <Text.Heading className="mb-2">Forgot Password </Text.Heading>
        <Text.SmallText className="text-dark-400 text-[13px]">
          No worries. we’ll send you reset instructions.{" "}
        </Text.SmallText>
      </div>

      <div className="flex-col gap-12  ">
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
                  message: "Enter a valid email address",
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
        <Button
          className="cursor-pointer w-full mb-4 mt-8 min-h-12 relative"
          disabled={verifying}
          type="submit"
        >
          {verifying ? (
            <LoadingTemplate isMessage={false} variant="small" />
          ) : (
            <Button.Text>Verify Email</Button.Text>
          )}
        </Button>

        <AuthQuestion link="/login" linkTxt="Sign in" text="Back to" />
      </div>
    </form>
  );
};

export default EmailVerification;
