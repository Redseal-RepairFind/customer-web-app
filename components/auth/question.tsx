import Link from "next/link";
import Text from "../ui/text";

const AuthQuestion = ({
  text,
  link,
  linkTxt,
  isAction,
  action,
}: {
  text: string;
  link: string;
  linkTxt: string;
  isAction?: boolean;
  action?: () => void;
}) => {
  return (
    <span className="flex-row-center gsp-3">
      <Text.SmallText className="mr-2">{text}</Text.SmallText>
      {isAction ? (
        <button onClick={action}>
          <Text.SmallText className="font-semibold">{linkTxt}</Text.SmallText>
        </button>
      ) : (
        <Link href={link}>
          <Text.SmallText className="font-semibold">{linkTxt}</Text.SmallText>
        </Link>
      )}
    </span>
  );
};

export default AuthQuestion;
