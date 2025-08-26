import Link from "next/link";
import Image from "next/image";
import RepairfindLogo from "./logo";
import Text from "./text";
import { footerItems } from "@/lib/constants";
import { usePageNavigator } from "@/hook/navigator";

/**
 * Optional (but recommended) typing if you control `footerItems`
 * type FooterLink = { title: string; link: string };
 * type FooterItems = {
 *   aboutUs: FooterLink[];
 *   business: FooterLink[];
 *   socials: { title: string; link: string; icon: string }[];
 * };
 */

const Footer = () => {
  const year = new Date().getFullYear();

  // unify columns so render logic is simpler
  const sections: {
    heading: string;
    items: { title: string; link: string }[];
  }[] = [
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
      className={` bg-dark md:px-20 md:pt-14 ${
        isHome || isAuth ? "lay-bg" : ""
      }`}
    >
      <div className="min-h-[226px] py-8 flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
        {/* Left side: Logo + link sections */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
          {/* Logo */}
          <div className="">
            <RepairfindLogo />
          </div>

          {/* Link sections */}
          <nav aria-label="Footer" className="flex gap-12">
            {sections.map((section) => (
              <div key={section.heading} className="flex-cols">
                <Text.SmallText className="text-white/80 mb-2">
                  {section.heading}
                </Text.SmallText>
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

        {/* Right side: Follow us */}
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

      {/* Bottom bar */}
      <div className="border-t border-white/10 md:px-20">
        <div className="flex-row-between py-4 text-white/70 text-xs">
          <span>&copy; {year} Repairfind. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
