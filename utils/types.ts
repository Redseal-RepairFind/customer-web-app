export type SignupType = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: {
    code: string;
    number: string;
  };
  password: string;
  passwordConfirmation: string;
  subscriptionType: "BUSINESS" | "RESIDENTIAL";
  equipmentAgeCategory: string;
  coverageAddress: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  acceptTerms: boolean;
  businessName?: string;
};

export type ExtraInfo = {
  subscriptionType: "BUSINESS" | "RESIDENTIAL";
  equipmentAgeCategory: string;
  coverageAddress: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  acceptTerms: boolean;
  country: any;
};

export type SubscriptionType = {
  planId: string;
  equipmentAgeRange: string;
  equipmentAgeCategory: string;
  subscriptionType: "BUSINESS" | "RESIDENTIAL";
  coverageAddress: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
    descrition?: string;
  };
  businessName?: string;
};
export type CoverageAddress = {
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  country: string;
  [key: string]: any; // Optional: if there are other fields
};

export type JobCounts = {
  total: number;
  ongoing: number;
  done: number;
  booked: number;
  pending: number;
};

export type Subscription = {
  id: string;
  autoRenew: boolean;
  billingFrequency: "MONTHLY" | "YEARLY" | string;
  coverageAddress: CoverageAddress;
  currency: string;
  equipmentAgeCategory: string | null;
  jobCounts: JobCounts;
  paymentAmount: number;
  planId: string;
  planType: "LEGACY" | "STANDARD" | string;
  startDate: string; // ISO string
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | string;
  subscriptionType: "RESIDENTIAL" | "COMMERCIAL" | string;
};

export type SubscriptionResponse = {
  data: Subscription[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RepairType = {
  serviceType: string;
  date: string;
  time: string;
  description: string;
  subscriptionId: string;
  language: string;
  emergency: boolean;
};

export type RepaairsGetParams = {
  page: number;
  limit: number;
  type: "REPAIR";
  date?: Date | string;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  sorting?: string;
  contractorId?: string;
};
export type SubGetParams = {
  page: number;
  limit: number;
  planType?: "RESIDENTIAL" | "BUSINESS";
  search?: string;
  sort?: string;
};

interface Location {
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  [key: string]: any; // For any extra fields
}

export interface RepairJob {
  id: string;
  jobId: string;
  reference: string;
  customer: string;
  subscription: string;
  category: string;
  title: string;
  description: string;
  language: string;
  type: "REPAIR" | string;
  status: "PENDING" | "ACTIVE" | "DONE" | "CANCELLED" | string;

  bookingViewedByContractor: boolean;
  isPublicRequest: boolean;
  isAssigned: boolean;
  isDisputable: boolean;
  isFromWeb: boolean;
  isViewed: boolean;
  isSaved: boolean;
  isChangeOrder: boolean;
  requiresSiteVisit: boolean;
  revisitEnabled: boolean;
  emergency: boolean;
  hasUnrepliedEnquiry: boolean;

  date: string; // ISO format date
  createdAt: string;
  updatedAt: string;
  expiresIn: string | null;

  distance: number;

  location: Location;

  myQuotation: any | null;

  contractors: any[]; // could be typed if you know contractor structure
  conversations: any[];
  enquiries: any[];
  quotations: any[];
  jobHistory: any[];
  media: any[];
  payments: any[];
  reminders: any[];
  tags: any[];
  hideFrom: any[];
  viewedBy: any[];

  [key: string]: any; // fallback for unexpected fields
}

export interface Subscriptions {
  id: string;
  autoRenew: boolean;
  billingFrequency: "MONTHLY" | "YEARLY" | string;
  coverageAddress: CoverageAddress;
  currency: string; // e.g., "cad"
  equipmentAgeCategory: string | null; // e.g., "1-4" or null
  jobCounts: JobCounts;
  paymentAmount: number;
  planId: string;
  planType: "LEGACY" | "BASIC" | "PREMIUM" | string;
  startDate: string; // ISO date string
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | string;
  subscriptionType: "RESIDENTIAL" | "COMMERCIAL" | string;
}
export type UpgradeType = {
  subscriptionId: string;
  newPlanId?: string;
};

export type Notification = {
  _id: string;
  category: string; // e.g., "GENERAL"
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  readAt: string | null;
  entity: any; // You can specify a more accurate type if you know the structure
  type: string; // e.g., "SUBSCRIPTION_PAYMENT"
  message: string;
  user: string; // User ID
  userType: "customers" | string; // If you only expect "customers", make it a union
  heading: {
    name: string;
    image: string;
  };
  data: {
    subscriptionId: string;
    planName: string;
    planType: string;
    amount: number;
    currency: string;
    [key: string]: any; // in case there are additional dynamic properties
  };
  __v: number;
};

export interface NotificationsPayload {
  bookingAlerts: any[]; // replace `any` with the actual type if known
  bookingConversationAlerts: any[];
  disputeAlerts: any[];
  jobAlerts: any[];
  jobConversationAlerts: any[];
  jobEstimateAlerts: any[];
  jobScheduleAlerts: string[]; // seems to be array of IDs
  quickActions: any[];
  totalCount: number;
  unReadNotifications: string[]; // array of notification IDs
  unseenBookings: any[];
}

export interface NotificationsResponse {
  payload: {
    data: NotificationsPayload;
  };
}

export const LANG_ID = "rpf_lng";

export const SUB_EXTRA_ID = "extra_sub";
