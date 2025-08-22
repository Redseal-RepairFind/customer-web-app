import { images } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

const RepairfindLogo = ({
  type = "default",
}: {
  type?: "default" | "link";
}) => {
  if (type === "link")
    return (
      <Link className="relative h-[92px] w-[92px]" href={"/"}>
        <Image fill src={images.icon} alt="Logo image" />
      </Link>
    );

  return (
    <div className="relative h-[92px] w-[92px]">
      <Image fill src={images.icon} alt="Logo image" />
    </div>
  );
};

export default RepairfindLogo;
