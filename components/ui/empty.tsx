import { icons } from "@/lib/constants";
import Image from "next/image";
import Text from "./text";

const EmptyPage = ({
  className,
  tytle,
  message,
}: {
  tytle: string;
  message: string;
  className?: string;
}) => {
  return (
    <div className={`w-full h-full ${className} flex-cols gap-2 items-center`}>
      <div className="w-[152px] h-[118px] relative ">
        <Image src={icons.illustrationIcon} fill alt="Illustration" />
      </div>

      <Text.SmallHeading>{tytle}</Text.SmallHeading>

      <Text.SmallText>{message}</Text.SmallText>
    </div>
  );
};

export default EmptyPage;
