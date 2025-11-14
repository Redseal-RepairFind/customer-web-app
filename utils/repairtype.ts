// Reusable primitives
type ISODateString = string;

export type MaintenanceStatus =
  | "BOOKED"
  | "ONGOING"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELED"
  | "REFUNDED"
  | "EXPIRED"
  | "PENDING"
  | "COMPLETED_SITE_VISIT"
  | "CONFIRMED";

export type JobType = "REPAIR" | "INSPECTION";

export interface Contractor {
  _id: string;
  firstName: string;
  lastName: string;
  id: string;
  profilePhoto: string;
}

export interface Location {
  address: string;
  city: string;
  country: string;
  latitude: string; // if numbers, change to number
  longitude: string; // if numbers, change to number
  state?: string;
}

export interface Schedule {
  startDate: ISODateString;
  estimatedDuration: number;
  type: "JOB_DAY" | string;
  _id: string;
}

export interface Metadata {
  autoCreated: boolean;
  createdBy: string;
  subscriptionId: string;
  inspectionDate?: ISODateString;
}

export interface RepairJob {
  _id: string;
  __v: number;
  bookingViewedByContractor: boolean;
  category: string;
  contractors: Contractor[];
  conversations: unknown[]; // refine if you have a shape
  createdAt: ISODateString;
  customer: string;
  description: string;
  distance: string; // "6.2620" (string in payload)
  emergency: boolean;
  enquiries: unknown[];
  expiryDate: ISODateString;
  hasUnrepliedEnquiry: boolean;
  hideFrom: string[];
  isAssigned: boolean;
  isChangeOrder: boolean;
  isDisputable: boolean;
  isFromWeb: boolean;
  isPublicRequest: boolean;
  isSaved: boolean;
  isViewed: boolean;
  jobHistory: unknown[];
  language: string;
  location: Location;
  media: unknown[];
  metadata: Metadata;
  missedCallsCount: number;
  myQuotation: unknown | null;
  payments: unknown[];
  quotations: unknown[];
  reminders: unknown[];
  requiresSiteVisit: boolean;
  revisitEnabled: boolean;
  schedule: Schedule;
  status: MaintenanceStatus;
  subscription: string;
  tags: string[];
  title: string;
  totalEnquires: number; // note the spelling in payload
  totalEnquiries: number;
  totalQuotations: number;
  type: JobType;
  unreadMessages: number;
  updatedAt: ISODateString;
  viewedBy: string[];
}
