"use client";

import { usePageNavigator } from "@/hook/navigator";
import Button from "../ui/custom-btn";
import Text from "../ui/text";
import AuthQuestion from "./question";

const CheckYourMail = () => {
  const { navigator } = usePageNavigator();

  // console.log(curPathname);
  return (
    <form className="flex-col md:px-5 gap-5 w-full">
      <div className="mb-4 flex-cols">
        <Text.Heading className="mb-2">Check your Email </Text.Heading>
        <Text.SmallText className="text-dark-400 text-[13px]">
          We sent a password reset link to your mail now akintomiwa23@gmail.com
        </Text.SmallText>
      </div>

      <Button
        className="cursor-pointer w-full mb-4"
        onClick={() => navigator.navigate("/forgotPassword/reset", "replace")}
      >
        <Button.Text>Open Email</Button.Text>
      </Button>
      <div className="flex-col gap-12  ">
        <AuthQuestion
          link=""
          linkTxt="Click Resend"
          text="Didn’t receive the email? "
          isAction
          action={() => {}}
        />
      </div>
    </form>
  );
};

export default CheckYourMail;
