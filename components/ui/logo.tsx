import { images } from "@/lib/constants";
import Image from "next/image";

export default function RepairfindLogo({
  type = "default",
  nav,
}: {
  type?: "default" | "link";
  nav?: boolean;
}) {
  const box =
    `relative block ` + // <-- make it block so h/w apply
    (nav ? "h-11 w-11" : "lg:h-[92px] lg:w-[92px] h-[83px] w-[83px]");

  if (type === "link") {
    return (
      <a
        href="https://www.repairfind.ca"
        target="_blank"
        rel="noopener noreferrer"
        className={box}
        aria-label="Open Repairfind in a new tab"
      >
        <Image fill src={images.icon} alt="Logo image" priority />
      </a>
    );
  }

  return (
    <div className={box}>
      <Image fill src={images.icon} alt="Logo image" priority />
    </div>
  );
}
