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
    name: "Manage Subscription",
    route: "/manage-subscription",
    icon: icons.subIcon,
    activeIcon: icons.subIconActive,
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

export const repTableH = [
  {
    name: "Job ID",
    size: "all",
    id: "1",
  },
  {
    name: "Services",

    size: "all",
    id: "2",
  },
  {
    name: "Technician",

    size: "sm",
    id: "3",
  },
  {
    name: "Progress",

    size: "sm",
    id: "4",
  },
  {
    name: "Status",
    size: "sm",
    id: "5",
  },
  {
    name: "Contact Technician",
    size: "sm",
    id: "6",
  },
  {
    name: "Action",
    size: "all",
    id: "7",
  },
];

export const repairTable = [
  {
    id: "#123",
    service: "Plumbing",
    technician: "Jasper Stark",
    status: "completed",
    progress: "Job is completed",
    contact: "available",
  },
  {
    id: "#1234",
    service: "Electrical",
    technician: "",
    status: "pending",
    progress: "Scheduling in Progress",
    contact: "",
  },
  {
    id: "#12345",
    service: "Painting",
    technician: "Olalekan Phillip",
    status: "ongoing",
    progress: "Awaiting Technician’s Arrival",
    contact: "availabe",
  },
];

export const messageTemplates = [
  "Hi, I’d like an update on progress of my repair request.",
  "When do you expect to arrive at my location?",
  "Could you please provide an estimated competition time?",
  "I have some additional questions about the work beign dobe.",
  "The issue seems to have gotten worse. Can you come back?",
  "Thank you for the great work! Everything looks perfect.",
];

export const dummyCommHistory = [
  {
    type: "message",
    item: {
      initiator: "You",
      message: "Hi whats up with the repairs",
      createdAt: new Date(),
    },
  },
  {
    type: "message",
    item: {
      initiator: "You",
      message: "I have arrived come get me",

      createdAt: new Date(),
    },
  },
  {
    type: "call",
    item: {
      initiator: "Mike Johnson",
      message: "Outgoing call - 3 min duration",
      createdAt: new Date(),
    },
  },
];

export const recommend = [
  "Yes, I would recommend",
  "No, I would not recommend",
];

export const issueType = [
  "Work not completed as agreed",
  "Quality of work is unsatisfactory",
  "Damage to property",
  "Billing/Pricing dispute",
  "Unprofessional behavior",
  "Safety concerns",
  "Others",
];

export const nextAct = [
  "We'll review your report within 24 hours",
  "Our team will contact you to discuss resolution options",
  "We may reach out to the contractor for their perspective",
  "We'll work to find a fair solution for all parties",
];

export const repairFilter = [
  {
    name: "Completed",
    id: "COMPLETED",
  },
  {
    name: "Ongoing",
    id: "ONGOING",
  },
  {
    name: "Pending",
    id: "PENDING",
  },
  {
    name: "Dispute",
    id: "DISPUTED",
  },
];
