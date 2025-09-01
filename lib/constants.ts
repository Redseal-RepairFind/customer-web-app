import worker from "@/public/image/worker.jpg";
import icon from "@/public/image/icon.png";
import landing from "@/public/image/landing.png";
import tools from "@/public/image/tools.jpg";
import home1 from "@/public/image/home.png";
import home from "@/public/image/pricing-home.png";
import linkedin from "@/public/icons/linkedin.png";
import facebook from "@/public/icons/facebook.png";
import instagram from "@/public/icons/instagram.png";
import disclaimer from "@/public/icons/disclaimer.png";

import canada from "@/public/icons/canada.png";
import spain from "@/public/icons/spain.png";
import india from "@/public/icons/india.png";
import china from "@/public/icons/china.png";
import france from "@/public/icons/france.png";
import greenPeople from "@/public/icons/greenPeople.png";
import whitePeople from "@/public/icons/whitePeople.png";
import tool1 from "@/public/image/tool-1.jpg";
import tool2 from "@/public/image/tool-2.jpg";
import tool3 from "@/public/image/tool-3.jpg";
import subpic from "@/public/image/subpic.png";

import eyeIcon from "@/public/icons/openeyeIcon.png";
import smsIcon from "@/public/icons/sms.png";
import downIcon from "@/public/icons/downIcon.png";
import infoIcon from "@/public/icons/info.png";
import hamburger from "@/public/icons/hamburger.png";

import dollarIcon from "@/public/icons/dollar-02.png";
import calendarIcon from "@/public/icons/calendar-2.png";
import checkIcon from "@/public/icons/tick-circle.png";
import starIcon from "@/public/icons/star-half.png";
import illustrationIcon from "@/public/icons/Illustration.png";

import chatIcon from "@/public/icons/chat.png";
import chatIconActive from "@/public/icons/chat-active.png";

import requestIcon from "@/public/icons/request.png";
import requestIconActive from "@/public/icons/request-active.png";

import referIcon from "@/public/icons/refer.png";
import referIconActive from "@/public/icons/refer-active.png";

import dashboardIcon from "@/public/icons/dashboard.png";
import dashboardIconActive from "@/public/icons/dashboard-active.png";

import accountIcon from "@/public/icons/account.png";
import accountIconActive from "@/public/icons/account-active.png";

import maintenanceIcon from "@/public/icons/maintenance.png";
import maintenanceIconActive from "@/public/icons/maintenance-active.png";

import logoutIcon from "@/public/icons/logout.png";

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
  home,
  home1,
  tool1,
  tool2,
  tool3,
  subpic,
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
  hamburger,
  chatIcon,
  chatIconActive,
  requestIcon,
  requestIconActive,
  referIcon,
  referIconActive,
  dashboardIcon,
  dashboardIconActive,
  accountIcon,
  accountIconActive,
  maintenanceIcon,
  maintenanceIconActive,
  logoutIcon,
  dollarIcon,
  calendarIcon,
  checkIcon,
  starIcon,
  illustrationIcon,
  disclaimer,
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

export const validations = [
  {
    name: "Must be at least 8 characters",
    id: "length",
  },
  {
    name: "Must contain one special character",
    id: "specialChar",
  },
  // {
  //   name: "Passwords must match",
  //   id: "match",
  // },
];

export const equipmentAge = [
  {
    name: "1 - 4 years",
    id: "1-4",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
  {
    name: "5 - 8 years",
    id: "5-8",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
  {
    name: "9+",
    id: "9+",
    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
  {
    name: "I don't know",
    id: "unknown",

    tag: "Tailored plans for businesses managing multiple properties and equipment.",
    variant: "green",
    icon: greenPeople,
  },
];

export const residentialAcctType: {
  title: string;
  type: string;
  placeHolder: string;
  list: any[];
  icon: any;
  notice: string;
  inputType: string;
  id: string;
}[] = [
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
    placeHolder: "Enter Last name",
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
export const businessAcctType: {
  title: string;
  type: string;
  placeHolder: string;
  list: any[];
  icon: any;
  notice: string;
  inputType: string;
  id: string;
}[] = [
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
    placeHolder: "Enter last name",
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
    id: "eqAge",
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

export const plans = [
  {
    name: "Starter Plan",
    billingCycle: {
      monthly: {
        price: 179.99,
        cycle: "monthly",
      },
      yearly: {
        price: 1979.89,
        slashed: 2159.88,
        cycle: "yearly",
      },
    },
    target: "For aged 0-4 years, included maintenance",
    features: [
      "Exhaust hood & fan check (Quarterly) - Clean hood to remove grease. Inspect the exhaust fan and motor to ensure they function properly. Replace or clean ventilation filters.",
      "Plumbing System (Quarterly). - Grease trap visual inspection and alert",
      "Plumbing - Repair leaks under sinks and dishwashers, clear and maintain drains. (Subscriber must request service)",
      "Heating/cooling (Bi-Annual). - Inspect gas lines and burners for leaks. Clean compressor and condenser coils. Change air filters and clean ducts. Inspect refrigeration door gaskets",
      "Safety & Compliance-(Annually) - Electrical panel inspection exit/emergency compliance check.",
      "Dishwasher check & descaling (Quarterly)",
      "30-Day Waiting Period",
      "Maintenance Records Dashboard. - All service visits logged digitally, helps with inspections, insurance, and maintenance reports",
      "Troubleshooting (1 call/year). - Electrical, Plumbing, and Heating & Cooling",
      "Free estimates for expansion/remodel projects.",
      "Certified Pros (Electrical, Plumbing, Heating/Cooling only )",
      "Service repair credit $3000 * - (All labour services are valued at $200/hr and applied towards the Service Repair Credit.)",
    ],
    benefits: [
      "Fast Response, Reliable Service",
      "Predictable Monthly Cost",
      "Peace of Mind 365 Days A Year",
      "Local Contractors, Licensed and Vetted",
      "Avoid Emergency Downtime and Lost Revenue",
      "Protect your plumbing, electrical, heat/cooling, and peace of mind with just one plan.",
    ],
  },
  {
    name: "Premium Plan",
    billingCycle: {
      monthly: {
        price: 299.99,
        cycle: "monthly",
      },
      yearly: {
        price: 3299.89,
        slashed: 3599.88,
        cycle: "yearly",
      },
    },
    target: "For equipment aged 5-8 years. Includes 1 rooftop HVAC unit.",
    features: [
      "Includes Starter plan",
      "Rooftop HVAC unit maintenance (Two) (Annual)",
      "Grease trap clean-out (Annual, if required)",
      "Fire Suppression Support (Annually) - Inspect the fire suppression system and arrange testing as required",
      "Electrical Load Balance & Circuit Check",
      "Appliance installation (2) Labour only",
      "30-Day Waiting Period",
      "Maintenance Records Dashboard. - All service visits logged digitally, helps with inspections, insurance, and maintenance reports",
      "Troubleshooting (1 call/year)- Electrical, Plumbing, and Heating & Cooling",
      "Free estimates for expansion/remodel projects",
      "Certified Pros (Electrical, Plumbing, Heating/Cooling only)",
      "Service repair credit $4,100 * - (All labour services are valued at $200/hr and applied towards the Service Repair Credit.)",
    ],
    benefits: [
      "Fast Response, Reliable Service",
      "Predictable Monthly Cost",
      "Peace of Mind 365 Days A Year",
      "Local Contractors, Licensed and Vetted",
      "Avoid Emergency Downtime and Lost Revenue",
      "Protect your plumbing, electrical, heat/cooling, and peace of mind with just one plan.",
    ],
  },
  {
    name: "Legacy Plan",
    billingCycle: {
      monthly: {
        price: 399.99,
        cycle: "monthly",
      },
      yearly: {
        price: 4399.89,
        slashed: 4799.88,
        cycle: "yearly",
      },
    },
    target: "For restaurants aged 9+ years. Includes 2 rooftop HVAC units.",
    features: [
      "Includes Premium plan",
      "Rooftop HVAC unit full service(Two) (Annual)",
      "Grease trap clean-out (Bi-Annual if required)",
      "Electrical & lighting system check (Annual)",
      "Fire Suppression Support (Annually) - Inspect the fire suppression system and arrange testing as required",
      "Appliance installation (2) Labour only",
      "30-Day Waiting Period",
      "Maintenance Records Dashboard. - All service visits logged digitally, helps with inspections, insurance, and maintenance reports",
      "Troubleshooting (1 call/year)- Electrical, Plumbing, and Heating & Cooling",
      "Free estimates for expansion/remodel projects",
      "Certified Pros (Electrical, Plumbing, Heating/Cooling only)",
      "Service repair credit $5,500 * - (All labour services are valued at $200/hr and applied towards the Service Repair Credit.)",
    ],
    benefits: [
      "Fast Response, Reliable Service",
      "Predictable Monthly Cost",
      "Peace of Mind 365 Days A Year",
      "Local Contractors, Licensed and Vetted",
      "Avoid Emergency Downtime and Lost Revenue",
      "Protect your plumbing, electrical, heat/cooling, and peace of mind with just one plan.",
    ],
  },
];

export const nav = [
  {
    name: "Why RepairFind",
    route: "/why-me",
  },
  {
    name: "How it works",
    route: "/how-it-works",
  },
  {
    name: "Contractors",
    route: "/contractors",
  },
  {
    name: "Explore Services",
    route: "/services",
  },
  {
    name: "Blogs",
    route: "/blogs",
  },
  {
    name: "Contact us",
    route: "/contact-us",
  },
];
