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
  paymentMethodId?: string;
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
  planName?: string;
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
  contract: Contract | null;
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
  remainingCredits: number;
  planName?: string;
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

export type ContractorBreakdown = {
  subtotal: number;
  gst: number;
  downPayment: number;
  processingFee: number;
  serviceFee: number;
  [key: string]: number; // allow extra numeric keys if backend adds more
};

export type CustomerBreakdown = {
  subtotal: number;
  gst: number;
  processingFee: number;
  estimateDiscount: number;
  couponDiscount: number;
  [key: string]: number;
};

export type ContractorRates = {
  serviceFeeRate: number;
  gstRate: number;
  processingFeeRate: number;
};

type ContractorSummary = {
  discounts: any[]; // replace `any` with proper type if you know discount shape
  breakdown: Record<string, number>;
  deductions: Record<string, number>;
  deductions_meta: any[];
  customer_breakdown_meta: any[];
  [key: string]: unknown; // safe for extra fields like totals, etc.
};

type CustomerSummary = {
  discounts: any[];
  breakdown: Record<string, number>;
  breakdown_meta: any[];
  description: string;
  [key: string]: unknown;
};

export type Contract = {
  charges: {
    contractorBreakdown: ContractorBreakdown;
    contractorPayable: number;
    contractorProcessingFeeRate: number;
    contractorRates: ContractorRates;
    contractorSummary: ContractorSummary;
    customerBreakdown: CustomerBreakdown;
    customerPayable: number;
    customerProcessingFeeRate: number;
    customerSummary: CustomerSummary;
    downPaymentAmount: number;
    downPaymentExcessAmount: number;
    gstRate: number;
    repairfindServiceFeeRate: number;
    subtotal: number;
  };
  estimates: {
    description: string;
    quantity: string | string;
    rate: number;
    _id: string;
  }[];
  _id: string;
  isDraft: boolean;
};

export type MessageItem = {
  createdAt: string; // ISO 8601 timestamp
  dispute: string | null; // Dispute details, or null if no dispute
  entity: string; // Entity ID (e.g., '68c4276265bb848bad1aea48')
  entityType: "jobs"; // Type of entity (hardcoded as 'jobs')
  heading: {
    name: string; // Name of the entity (e.g., 'Aaron Electrical')
    image: string; // URL of the image
    lastMessage: string; // Last message sent
    lastMessageAt: string; // Timestamp of last message
    unreadCount: number; // Number of unread messages
  };
  id: string; // Job ID
  isBlocked: boolean; // Blocked status
  isBlockedBy: string | null; // ID of the entity that blocked, or null
  isLocked: boolean; // Locked status
  job: string; // Job ID (links to job entity)
  lastMessage: string; // Last message content
  lastMessageAt: string; // Timestamp of the last message
  members: {
    member: string; // ID of the member
    memberType: "customers" | "contractors"; // Type of the member
  }[]; // Array of job members (customers and contractors)
  quotation: string; // Quotation ID
  type: "JOB"; // Type of entity (hardcoded as 'JOB')
  updatedAt: string; // ISO 8601 timestamp
};

export type CallItem = {
  duration: string;
  endTime: string;
  startTime: string;
  heading: {
    name: string; // Name of the entity (e.g., 'Aaron Electrical')
    image: string; // URL of the image
    lastMessage: string; // Last message sent
    lastMessageAt: string; // Timestamp of last message
    unreadCount: number; // Number of unread messages
  };
  phoneNumber: {
    code: string;
    number: string;
    verifiedAt: string;
  };
  status: string;
  id: string;
  _id: string;
  fromUser: string;
  toUser: string;
  fromUserType: "customers" | "contractors";
  toUserType: "customers" | "contractors";
};

export type singleConversationType = {
  job: string;
  createdAt: string;
  dispute: string | null;
  entity: {
    _id: string;
    reference: string;
    customer: string;
    status: string; // E.g., 'DISPUTED'
    type: string; // E.g., 'REPAIR'
    category: string; // E.g., 'Electrical'
    description: string; // E.g., 'Lucky Test Subscription Job'
    title: string; // E.g., 'Electrical'
    location: {
      address: string; // E.g., '1 Mount Zion Ln, Abakpa, Enugu 400103, Enugu, Nigeria'
      city: string; // E.g., 'Enugu'
      country: string; // E.g., 'Nigeria'
      latitude: string; // E.g., '37.58821704'
      longitude: string; // E.g., '-122.41138618'
      _id: string;
    };
    date: string; // E.g., '2025-09-12T14:59:00.000Z'
    tags: string[]; // Array of tags, e.g., []
    payments: any[]; // Array of payments, define structure if needed
    myQuotation: string | null;
    emergency: boolean;
    isAssigned: boolean;
    isChangeOrder: boolean;
    distance: string;
    hideFrom: any[]; // Define the type if needed
    viewedBy: string[]; // Array of user IDs who viewed the job
    isViewed: boolean;
    reminders: {
      type: "AT_START_TIME";
      sentToContractorAt: string;
      sentToCustomerAt: string;
      customerMessage: string;
      contractorMessage: string;
    }[];
    enquiries: any[]; // Define the structure of enquiries if needed
    totalEnquires: number;
    hasUnrepliedEnquiry: boolean;
    isSaved: boolean;
    revisitEnabled: boolean;
    bookingViewedByContractor: boolean;
    language: string; // E.g., 'en'
    requiresSiteVisit: boolean;
    isDisputable: boolean;
    isPublicRequest: boolean;
    conversations: {
      id: string;
      contractor: string;
      quotation: string;
    }[];
    contractors: string[]; // Array of contractor IDs
    isFromWeb: boolean;
    subscription: string;
    media: any[]; // Array of media, define structure if needed
    jobHistory: {
      eventType: string;
      timestamp: string;
      payload: {
        contractor?: string;
        appVersion: string;
        deviceId: string;
        appType: string;
        confirmedBy?: string;
        jobDay?: string;
        estimates?: {
          description: string;
          quantity: number;
          rate: number;
          amount: number;
        }[];
      };
      _id: string;
    }[];
    quotations: {
      id: string;
      contractor: string;
      isBid: boolean;
      _id: string;
    }[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    contract: string;
    contractor: string;
    schedule: {
      startDate: string;
      estimatedDuration: number;
      type: "JOB_DAY";
      remark: string;
      _id: string;
      endDate: string;
    };
    statusUpdate: {
      awaitingConfirmation: boolean;
      isCustomerAccept: boolean;
      isContractorAccept: boolean;
      status: "REJECTED" | "APPROVED" | string;
      _id: string;
    };
    totalQuotations: number;
    expiresIn: string | null;
    jobId: string;
    id: string;
  };
  entityType: "jobs";
  heading: {
    name: string; // E.g., 'Aaron Electrical'
    image: string; // Image URL, E.g., 'https://repairfindbucket.s3-eu-west-3.amazonaws.com/e6acc06f-839c-4017-9a99-884c5cb680b8.jpg'
    lastMessage: string; // E.g., 'Job marked as complete by contractor'
    lastMessageAt: string; // E.g., '2025-09-12T16:12:56.145Z'
    unreadCount: number; // E.g., 1
    language: string; // E.g., 'en'
  };
  isBlocked: boolean;
  isLocked: boolean;
  members: {
    member: string; // ID of the member (user)
    memberType: "customers" | "contractors"; // Type of the member
  }[];
  quotation: string; // Quotation ID
  type: "JOB"; // Job type
  updatedAt: string;
  lastMessage: string; // Last message content
  lastMessageAt: string; // Timestamp of last message
  id: string; // ID of the job conversation
};

type MessagePayload = {
  eventType?: string; // E.g., 'JOB_MARKED_COMPLETE_BY_CONTRACTOR'
  job?: string; // Job ID
  contractor?: string; // Contractor ID
  customer?: string; // Customer ID
  booking?: string; // Booking ID
};

export type Message = {
  _id: string; // Unique ID for the message
  conversation: string; // Conversation ID
  sender: string; // Sender ID
  senderType: "contractors" | "customers"; // Sender type
  messageType: "ALERT" | string; // Type of message (ALERT, etc.)
  message: string | any; // The actual message content
  readBy: string[]; // List of users who have read the message
  entity: string; // Entity ID related to the message (e.g., Job ID)
  entityType: "jobs"; // Type of entity (hardcoded as 'jobs')
  payload: MessagePayload; // Additional payload data (e.g., job status)
  createdAt: string; // Timestamp when the message was created
  media: any[]; // Array of media files (if any, define the structure if needed)
  updatedAt: string; // Timestamp when the message was last updated
  __v: number; // Version key
  isOwn: boolean; // Whether the message was sent by the user themselves
};

export type AgoraType = {
  channelName: string;
  role: string;
};

export type MakeCallType = {
  toUser: string;
  toUserType: string;
};

export type EndCall = {
  event: "missed" | "declined" | "ended";
  id: string;
};

export type OutgoingPayload =
  // | { id: string; message: { type: "TEXT"; message: string } }
  // |

  {
    id: string;
    message: {
      type: "MEDIA" | "TEXT";
      media?: File[];
      message?: string;
    };
  };
export type MessagesData = Message[];

export const LANG_ID = "rpf_lng";

export const SUB_EXTRA_ID = "extra_sub";
