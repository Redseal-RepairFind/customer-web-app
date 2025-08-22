import worker from "@/public/image/worker.jpg";
import icon from "@/public/image/icon.png";
import landing from "@/public/image/landing.png";
import tools from "@/public/image/tools.jpg";
import linkedin from "@/public/icons/linkedin.png";
import facebook from "@/public/icons/facebook.png";
import instagram from "@/public/icons/instagram.png";

import canada from "@/public/icons/canada.png";
import spain from "@/public/icons/spain.png";
import india from "@/public/icons/india.png";
import china from "@/public/icons/china.png";
import france from "@/public/icons/france.png";
import greenPeople from "@/public/icons/greenPeople.png";
import whitePeople from "@/public/icons/whitePeople.png";

import eyeIcon from "@/public/icons/openeyeIcon.png";
import smsIcon from "@/public/icons/sms.png";
import downIcon from "@/public/icons/downIcon.png";
import infoIcon from "@/public/icons/info.png";

export const accountType = [
  {
    name: "Residential Subscription",
    tag: "Perfect for homeowners and tenants looking for quick, reliable repairs.",
    variant: "black",
    icon: whitePeople,
    id: "RESIDENTIAL",
  },
  {
    name: "Business Subscription",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
    id: "BUSINESS",
  },
];

export const images = {
  worker,
  icon,
  landing,
  tools,
};

export const icons = {
  canada,
  spain,
  india,
  china,
  france,
  greenPeople,
  whitePeople,
  eyeIcon,
  smsIcon,
  downIcon,
  infoIcon,
};

export const socialIcons = {
  linkedin,
  facebook,
  instagram,
};

export const footerItems = {
  aboutUs: [
    {
      title: "About Us",
      link: "/about-us",
    },
    {
      title: "How it works",
      link: "/info",
    },
    {
      title: "Contractors",
      link: "/contractors",
    },
    {
      title: "Explore Services",
      link: "/explore",
    },
    {
      title: "FAQ",
      link: "/faq",
    },
  ],

  business: [
    {
      title: "For business",
      link: "/business",
    },
    {
      title: "Contact Us",
      link: "/contact",
    },
    {
      title: "Terms Of Service",
      link: "/terms",
    },
    {
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
  ],
  socials: [
    {
      title: "LinkedIn",
      link: "https://www.linkedin.com/company/repairfind/",
      icon: socialIcons.linkedin,
    },
    {
      title: "Facebook",
      link: "https://www.facebook.com/Repairfind/",
      icon: socialIcons.facebook,
    },
    {
      title: "Instagram",
      link: "https://www.instagram.com/repairfind/",
      icon: socialIcons.instagram,
    },
  ],
};

export const countries = [
  {
    name: "Canada",
    flag: icons.canada,
    code: "CA",
    dial_code: "+1",
    lang: "English",
  },
  {
    name: "France",
    flag: icons.france,
    code: "FR",
    dial_code: "+33",
    lang: "French",
  },
  {
    name: "India",
    flag: icons.india,
    code: "IN",
    dial_code: "+91",
    lang: "Punjabi",
  },
  {
    name: "China",
    flag: icons.china,
    code: "CN",
    dial_code: "+86",
    lang: "Mandarin",
  },
  {
    name: "Spain",
    flag: icons.spain,
    code: "ES",
    dial_code: "+34",
    lang: "Spanish",
  },
];

export const equipmentAge = [
  {
    name: "1 - 4 years",
    id: "1to4",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
  {
    name: "5 - 8 years",
    id: "5to8",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
  {
    name: "9+",
    id: "9plus",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
  {
    name: "I don't know",
    id: "idontknow",

    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
];

export const residentialAcctType = [
  {
    title: "Account Type",
    type: "drop_down",
    placeHolder: "Residential Subscription",
    id: "acctType",
    icon: icons.downIcon,
    notice: "",
    inputType: "",
    list: accountType,
  },
  {
    title: "First Name",
    type: "input",
    placeHolder: "Enter first name",
    id: "firstName",
    icon: "",
    notice: "",
    inputType: "text",
    list: [],
  },
  {
    title: "Last Name",
    type: "input",
    placeHolder: "enter first name",
    id: "lastName",
    icon: "",
    notice: "",
    inputType: "text",
    list: [],
  },

  {
    title: "Email Address",
    type: "input",
    placeHolder: "Enter email address",
    id: "email",
    icon: icons.smsIcon,
    notice: "",
    inputType: "email",
    list: [],
  },
  {
    title: "Phone Number",
    type: "input",
    placeHolder: "Enter Phone number",
    id: "number",
    icon: "",
    notice: "",
    inputType: "number",
    list: [],
  },
  {
    title: "Home Address",
    type: "drop_down",
    placeHolder: "Enter Address",
    id: "homeAddress",
    icon: "",
    notice: " notice text",
    inputType: "",
    list: [],
  },
  {
    title: "Age of Equipment",
    type: "drop_down",
    placeHolder: "Select age",
    id: "",
    icon: icons.downIcon,
    notice: "notice text",
    inputType: "",
    list: equipmentAge,
  },
  {
    title: "Password",
    type: "input",
    placeHolder: "Enter password",
    id: "password",
    icon: icons.eyeIcon,
    notice: "",
    inputType: "password",
    list: [],
  },
  {
    title: "Confirm Password",
    type: "input",
    placeHolder: "Confirm Password",
    id: "confirmPassword",
    icon: icons.eyeIcon,
    notice: "",
    inputType: "password",
    list: [],
  },
];
export const businessAcctType = [
  {
    title: "Account Type",
    type: "drop_down",
    placeHolder: "Residential Subscription",
    id: "acctType",
    icon: icons.downIcon,
    notice: "",
    inputType: "",
    list: accountType,
  },
  {
    title: "Business Name",
    type: "input",
    placeHolder: "Enter business name",
    id: "businessName",
    icon: "",
    notice: "",
    inputType: "text",
    list: [],
  },
  {
    title: "Contact Person's First Name",
    type: "input",
    placeHolder: "Enter first name",
    id: "firstName",
    icon: "",
    notice: "",
    inputType: "text",
    list: [],
  },
  {
    title: "Contact Person's Last Name",
    type: "input",
    placeHolder: "enter first name",
    id: "lastName",
    icon: "",
    notice: "",
    inputType: "text",
    list: [],
  },

  {
    title: "Email Address",
    type: "input",
    placeHolder: "Enter email address",
    id: "email",
    icon: icons.smsIcon,
    notice: "",
    inputType: "email",
    list: [],
  },
  {
    title: "Phone Number",
    type: "input",
    placeHolder: "Enter Phone number",
    id: "number",
    icon: "",
    notice: "",
    inputType: "number",
    list: [],
  },
  {
    title: "Home Address",
    type: "drop_down",
    placeHolder: "Enter Address",
    id: "homeAddress",
    icon: "",
    notice: " notice text",
    inputType: "",
    list: [],
  },
  {
    title: "Age of Equipment",
    type: "drop_down",
    placeHolder: "Select age",
    id: "",
    icon: icons.downIcon,
    notice: "notice text",
    inputType: "",
    list: equipmentAge,
  },
  {
    title: "Password",
    type: "input",
    placeHolder: "Enter password",
    id: "password",
    icon: icons.eyeIcon,
    notice: "",
    inputType: "password",
    list: [],
  },
  {
    title: "Confirm Password",
    type: "input",
    placeHolder: "Confirm Password",
    id: "confirmPassword",
    icon: icons.eyeIcon,
    notice: "",
    inputType: "password",
    list: [],
  },
];
