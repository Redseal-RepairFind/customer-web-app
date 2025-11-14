import { icons, images } from "./constants";

export type MaintenanceStatus =
  | "BOOKED"
  | "ONGOING"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELED"
  | "REFUNDED"
  | "EXPIRED"
  | "PENDING";

// ---- Types ---------------------------------------------------------------

type Priority = "High" | "Medium" | "Low";

export type Contractor = {
  name: string;
  image: string; // logo/avatar URL
  phone?: string;
};

export type TimeWindow = {
  startISO: string; // e.g. "2025-04-18T10:00:00Z"
  endISO: string; // e.g. "2025-04-18T12:00:00Z"
};

export type RescheduleRequest = {
  by: "CUSTOMER" | "TECHNICIAN";
  original: TimeWindow;
  requested: TimeWindow;
  reason: string;
  requestedAt: string; // ISO timestamp
};

export type TechnicianStatus = {
  arrived?: string; // ISO times
  workStarted?: string;
  estCompletion?: string;
  progressNote?: string;
};

export type DisputeInfo = {
  issue: string;
  reportedAt: string; // ISO date
  originalCompletion: string; // ISO date
  reason: string;
};

export type MaintenanceItemType = {
  id: string;
  title: string;
  category: string;
  frequency?: string; // e.g. "Every 3 months"
  priority: Priority;
  tags?: string[]; // e.g. ["Scheduled", "Warranty Covered"]
  preferredContractor: Contractor;

  dueDate: string; // ISO date (day-level)
  timeWindow: TimeWindow; // upcoming slot
  daysRemaining?: number;

  status: MaintenanceStatus; // <-- only from your union
  serviceNotes?: string;
  warrantyCovered?: boolean;

  technicianStatus?: TechnicianStatus;
  rescheduleRequest?: RescheduleRequest;
  dispute?: DisputeInfo;
};

// ---- Dummy Data (5 cards) -----------------------------------------------

export const maintenanceLogData: MaintenanceItemType[] = [
  {
    id: "job-875540",
    title: "Filter Replacement & Cleaning",
    category: "HVAC",
    frequency: "Every 3 months",
    priority: "High",
    tags: ["Scheduled"],
    preferredContractor: {
      name: "Robert Davies",
      image: "https://placehold.co/64x64?text=RD",
      phone: "+1 (555) 111-2244",
    },
    dueDate: "2025-04-18",
    timeWindow: {
      startISO: "2025-04-18T10:00:00Z",
      endISO: "2025-04-18T12:00:00Z",
    },
    daysRemaining: 3,
    status: "BOOKED",
    serviceNotes:
      "Filter showing signs of wear; should be replaced soon for optimal efficiency.",
  },

  {
    id: "job-875541",
    title: "Aerator Cleaning & Replacement",
    category: "Plumbing",
    frequency: "Every 6 months",
    priority: "Medium",
    tags: ["Pending Reschedule Request", "Warranty Covered"],
    warrantyCovered: true,
    preferredContractor: {
      name: "Robert Davies",
      image: "https://placehold.co/64x64?text=RD",
      phone: "+1 (555) 111-2244",
    },
    dueDate: "2025-04-20",
    timeWindow: {
      startISO: "2025-04-20T10:00:00Z",
      endISO: "2025-04-20T12:00:00Z",
    },
    daysRemaining: 5,
    status: "PENDING",
    serviceNotes:
      "Regular maintenance to ensure proper water flow and prevent mineral buildup.",
    rescheduleRequest: {
      by: "CUSTOMER",
      original: {
        startISO: "2025-04-20T14:00:00Z",
        endISO: "2025-04-20T16:00:00Z",
      },
      requested: {
        startISO: "2025-04-22T09:00:00Z",
        endISO: "2025-04-22T11:00:00Z",
      },
      reason: "Customer requested different time slot due to work schedule.",
      requestedAt: "2025-04-18T08:30:00Z",
    },
  },

  {
    id: "job-875542",
    title: "Battery Replacement & Testing",
    category: "General",
    frequency: "Yearly",
    priority: "High",
    tags: ["Technician Reschedule Request"],
    preferredContractor: {
      name: "Robert Davies",
      image: "https://placehold.co/64x64?text=RD",
      phone: "+1 (555) 111-2244",
    },
    dueDate: "2025-04-20",
    timeWindow: {
      startISO: "2025-04-20T10:00:00Z",
      endISO: "2025-04-20T12:00:00Z",
    },
    daysRemaining: 4,
    status: "PENDING",
    serviceNotes:
      "Safety critical – test all detectors and replace batteries as needed.",
    rescheduleRequest: {
      by: "TECHNICIAN",
      original: {
        startISO: "2025-04-19T09:00:00Z",
        endISO: "2025-04-19T11:00:00Z",
      },
      requested: {
        startISO: "2025-04-21T13:00:00Z",
        endISO: "2025-04-21T15:00:00Z",
      },
      reason: "Previous job running longer than expected.",
      requestedAt: "2025-04-18T11:10:00Z",
    },
  },

  {
    id: "job-875543",
    title: "Annual Tune-up",
    category: "HVAC",
    frequency: "Every 12 months",
    priority: "Medium",
    tags: ["Ongoing"],
    preferredContractor: {
      name: "Robert Davies",
      image: "https://placehold.co/64x64?text=RD",
      phone: "+1 (555) 111-2244",
    },
    dueDate: "2025-04-21",
    timeWindow: {
      startISO: "2025-04-21T09:00:00Z",
      endISO: "2025-04-21T11:30:00Z",
    },
    status: "ONGOING",
    technicianStatus: {
      arrived: "2025-04-21T09:00:00Z",
      workStarted: "2025-04-21T09:15:00Z",
      estCompletion: "2025-04-21T11:00:00Z",
      progressNote:
        "Cleaning coils and checking refrigerant levels. System running within expected range.",
    },
  },

  {
    id: "job-875544",
    title: "New GFCI Outlet Installation",
    category: "Electrical",
    frequency: "One-off",
    priority: "Medium",
    tags: ["Disputed", "Warranty Covered"],
    warrantyCovered: true,
    preferredContractor: {
      name: "Robert Davies",
      image: "https://placehold.co/64x64?text=RD",
      phone: "+1 (555) 111-2244",
    },
    dueDate: "2025-04-20",
    timeWindow: {
      startISO: "2025-04-20T10:00:00Z",
      endISO: "2025-04-20T12:00:00Z",
    },
    daysRemaining: 7,
    status: "DISPUTED",
    serviceNotes: "Install new GFCI outlet for kitchen island.",
    dispute: {
      issue: "Work quality concerns – outlet not properly grounded.",
      reportedAt: "2025-04-15T00:00:00Z",
      originalCompletion: "2025-04-15T00:00:00Z",
      reason: "Customer requested different time slot due to work schedule.",
    },
  },
];

export type MaintenanceRow = {
  id: string;
  itemService: string;
  contractor: Contractor;
  completedDate: string | null; // ISO date or null
  cost: number;
  status: MaintenanceStatus;
  contactTechnician: { name: string; phone: string };
  action: "View" | "Schedule" | "Track" | "Cancel";
};

export const maintenanceTableRows: MaintenanceRow[] = [
  {
    id: "m-1001",
    itemService: "Elevator — Monthly Inspection",
    contractor: {
      name: "LiftCare Co.",
      image: "https://placehold.co/80x80?text=LiftCare",
    },
    completedDate: "2025-11-02",
    cost: 120000,
    status: "COMPLETED",
    contactTechnician: { name: "Aisha Bello", phone: "+2348031234567" },
    action: "View",
  },
  {
    id: "m-1002",
    itemService: "Generator — Oil Change",
    contractor: {
      name: "PowerMax Services",
      image: "https://placehold.co/80x80?text=PowerMax",
    },
    completedDate: "2025-11-05",
    cost: 85000,
    status: "COMPLETED",
    contactTechnician: { name: "Chinedu Okoye", phone: "+2347069870011" },
    action: "View",
  },
  {
    id: "m-1003",
    itemService: "HVAC — Filter Replacement",
    contractor: {
      name: "Arctic Air Ltd.",
      image: "https://placehold.co/80x80?text=ArcticAir",
    },
    completedDate: null,
    cost: 65000,
    status: "BOOKED",
    contactTechnician: { name: "Tunde Ade", phone: "+2348094442211" },
    action: "Schedule",
  },
  {
    id: "m-1004",
    itemService: "Plumbing — Leak Fix (Bldg B)",
    contractor: {
      name: "ClearFlow Plumbing",
      image: "https://placehold.co/80x80?text=ClearFlow",
    },
    completedDate: "2025-10-29",
    cost: 40500,
    status: "DISPUTED",
    contactTechnician: { name: "Ngozi Uche", phone: "+2347013338899" },
    action: "View",
  },
  {
    id: "m-1005",
    itemService: "CCTV — Camera Replacement",
    contractor: {
      name: "SecureSight NG",
      image: "https://placehold.co/80x80?text=SecureSight",
    },
    completedDate: null,
    cost: 210000,
    status: "ONGOING",
    contactTechnician: { name: "Ibrahim Musa", phone: "+2348052227788" },
    action: "Track",
  },
];

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
  // {
  //   name: "Refer & Earn",
  //   route: "/referral",
  //   icon: icons.referIcon,
  //   activeIcon: icons.referIconActive,
  // },
];

export const otherNav = [
  // {
  //   name: "Account",
  //   route: "/settings",
  //   icon: icons.accountIcon,
  //   activeIcon: icons.accountIconActive,
  //   isLogout: false,
  // },
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
    name: "Accrued Credit",
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
export const dummyMaintenanceMetrics = [
  {
    name: "Completed Maintenance",
    icon: icons.checkIcon,
    metric: "9",
  },
  {
    name: "Upcoming Maintenance Credit",
    icon: icons.upcomingIcon,
    metric: "4",
  },
  {
    name: "Next Maintenance Date",
    icon: icons.calendarIcon,
    metric: new Date().toDateString(),
  },
  {
    name: "Remaining Yearly Maintenance",
    icon: icons.reloadIcon,
    metric: "2",
  },
];

export const repTableH = [
  {
    name: "Date",
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
export const maintenanceTableH = [
  {
    name: "Item & Service",
    size: "all",
    id: "1",
  },
  {
    name: "Contractor",
    size: "all",
    id: "2",
  },
  {
    name: "Scheduled Date",
    size: "sm",
    id: "3",
  },
  {
    name: "Address",
    size: "all",
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

export const recommend = ["Yes, I would love to", "No, i would not"];

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
