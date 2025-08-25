"use client";

import { usePageNavigator } from "@/hook/navigator";
import Button from "../ui/custom-btn";
import Text from "../ui/text";
import AuthQuestion from "./question";
import { InputContainer } from "./signup-item";

const EmailVerification = () => {
  const { navigator, curPathname } = usePageNavigator();
  return (
    <form className="flex-col md:px-5 gap-10 w-full">
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
            />
          </InputContainer>
        </div>
        <Button
          className="cursor-pointer w-full mb-4 "
          onClick={() =>
            navigator.navigate("/forgotPassword/checkEmail", "replace")
          }
        >
          <Button.Text>Verify email</Button.Text>
        </Button>

        <AuthQuestion link="/login" linkTxt="Sign in" text="Back to" />
      </div>
    </form>
  );
};

export default EmailVerification;
