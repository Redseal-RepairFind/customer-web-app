import { icons, images } from "./constants";

export const dashboardNav = [
  {
    name: "Dashboard",
    route: "/dashboard",
    icon: icons.dashboardIcon,
    activeIcon: icons.dashboardIconActive,
  },
  {
    name: "Repair Request",
    route: "/repair-request",
    icon: icons.requestIcon,
    activeIcon: icons.requestIconActive,
  },
  {
    name: "Inbox",
    route: "/inbox",
    icon: icons.chatIcon,
    activeIcon: icons.chatIconActive,
  },
  {
    name: "Maintenance Log",
    route: "/maintenance-log",
    icon: icons.maintenanceIcon,
    activeIcon: icons.maintenanceIconActive,
  },
  {
    name: "Refer & Earn",
    route: "/referral",
    icon: icons.referIcon,
    activeIcon: icons.referIconActive,
  },
];

export const otherNav = [
  {
    name: "Account",
    route: "/settings",
    icon: icons.accountIcon,
    activeIcon: icons.accountIconActive,
    isLogout: false,
  },
  {
    name: "Logout",
    route: "",
    icon: icons.logoutIcon,
    activeIcon: icons.logoutIcon,
    isLogout: true,
  },
];

export const slideImages = [images.tool1, images.tool2, images.tool3];

export const quickActions = [
  {
    name: "Maintenance Log",
    route: "/maintenance-log",
    icon: icons.maintenanceIcon,
    activeIcon: icons.maintenanceIconActive,
  },
  {
    name: "Check Messages",
    route: "/inbox",
    icon: icons.chatIcon,
    activeIcon: icons.chatIconActive,
  },
  {
    name: "Refer & Earn",
    route: "/referral",
    icon: icons.referIcon,
    activeIcon: icons.referIconActive,
  },
];

export const dummyMetrics = [
  {
    name: "Available Credits",
    icon: icons.dollarIcon,
    metric: "4850",
  },
  {
    name: "Completed Jobs",
    icon: icons.checkIcon,
    metric: "23",
  },
  {
    name: "Customer Ratings",
    icon: icons.starIcon,
    metric: "4.9",
  },
  {
    name: "Next Maintenance Date",
    icon: icons.calendarIcon,
    metric: "26/10/2025",
  },
];
