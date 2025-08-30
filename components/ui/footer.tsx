import Link from "next/link";
import Image from "next/image";
import RepairfindLogo from "./logo";
import Text from "./text";
import { footerItems } from "@/lib/constants";
import { usePageNavigator } from "@/hook/navigator";

const FOOTER_BAR_H = 56; // px — keep this in sync with the bottom bar height

const Footer = () => {
  const year = new Date().getFullYear();
  const sections = [
    { heading: "", items: footerItems.aboutUs },
    { heading: "", items: footerItems.business },
  ];
  const { curPathname } = usePageNavigator();
  const isHome = curPathname === "/";
  const isAuth =
    curPathname === "/login" ||
    curPathname === "/otp" ||
    curPathname === "/signup" ||
    curPathname === "/forgotPassword";

  return (
    <footer
      className={`sticky bottom-0 z-40 bg-dark md:px-20 md:pt-14 ${
        isHome || isAuth ? "lay-bg" : "lg:pl-[240px]"
      }`}
      style={{ /* optional: ensures paint when stuck */ contain: "paint" }}
      aria-label="Site footer"
    >
      {/* main footer content (scrolls normally until footer hits bottom) */}
      <div className="min-h-[226px] py-8 flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
          <RepairfindLogo />

          <nav aria-label="Footer links" className="flex gap-12">
            {sections.map((section) => (
              <div key={section.heading} className="flex-cols">
                {section.heading ? (
                  <Text.SmallText className="text-white/80 mb-2">
                    {section.heading}
                  </Text.SmallText>
                ) : null}
                <ul>
                  {section.items.map((item) => (
                    <li key={item.title} className="mb-3">
                      <Link
                        href={item.link}
                        className="outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
                      >
                        <Text.SmallText className="text-white hover:text-white/80 transition-colors">
                          {item.title}
                        </Text.SmallText>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Follow us */}
        <div className="flex-col-center gap-4">
          <Text.SmallText className="text-white">Follow us!</Text.SmallText>
          <ul className="flex-row-center gap-2">
            {footerItems.socials.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${item.title} in a new tab`}
                  className="inline-flex items-center justify-center rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <Image
                    src={item.icon}
                    alt={`${item.title} icon`}
                    width={24}
                    height={24}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* bottom bar (NOT sticky; parent handles sticking) */}
      <div className="border-t border-white/10 md:px-20 bg-dark/95 backdrop-blur supports-[backdrop-filter]:bg-dark/80 shadow-[0_-1px_0_0_rgba(255,255,255,0.08)]">
        <div
          className="flex-row-between text-white/70 text-xs"
          style={{ height: FOOTER_BAR_H }}
        >
          <span className="px-4 md:px-0">
            &copy; {year} Repairfind. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
