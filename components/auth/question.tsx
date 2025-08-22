import Link from "next/link";
import Text from "../ui/text";

const AuthQuestion = ({
  text,
  link,
  linkTxt,
}: {
  text: string;
  link: string;
  linkTxt: string;
}) => {
  return (
    <span className="flex-row-center gsp-3">
      <Text.SmallText className="mr-2">{text}</Text.SmallText>
      <Link href={link}>
        <Text.SmallText className="font-semibold">{linkTxt}</Text.SmallText>
      </Link>
    </span>
  );
};

export default AuthQuestion;
