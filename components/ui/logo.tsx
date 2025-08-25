import { images } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

const RepairfindLogo = ({
  type = "default",
  nav,
}: {
  type?: "default" | "link";
  nav?: boolean;
}) => {
  if (type === "link")
    return (
      <Link
        className={`relative ${
          nav ? "h-11 w-11" : "lg:h-[92px] lg:w-[92px] h-[83px] w-[83px]"
        }`}
        href={"/"}
      >
        <Image fill src={images.icon} alt="Logo image" />
      </Link>
    );

  return (
    <div
      className={`relative ${
        nav ? "h-11 w-11" : "lg:h-[92px] lg:w-[92px] h-[83px] w-[83px]"
      }`}
    >
      <Image fill src={images.icon} alt="Logo image" />
    </div>
  );
};

export default RepairfindLogo;
