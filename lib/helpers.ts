import Cookies from "js-cookie";
// import heic2any from "heic2any";

export const confirmPasswordCharacters = (chars: string) => {
  const minLength = /^.{8,}$/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/;
  const fullValidation = /^(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]).{8,}$/;

  if (chars.length < 3) {
    // Don't check yet — return neutral state
    return {
      length: false,
      specialChar: false,
      validate: false,
      skip: true, // optional flag you can use in the UI
    };
  }

  return {
    length: minLength.test(chars),
    specialChar: hasSpecialChar.test(chars),
    validate: fullValidation.test(chars),
    skip: false,
  };
};

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export const formatError = (error: any) => {
  return error?.response?.data?.message;
};

export const setCookie = async (name: string, item: any, dur?: number) => {
  Cookies.set(name, item, {
    expires: dur || 7,
    path: "/",
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
  });
};

export const readCookie = (name: string) => {
  const token = Cookies.get(name); // string | undefined

  return token && JSON?.parse(token as string);
};
export const readStringCookie = (name: string) => {
  const token = Cookies.get(name); // string | undefined
  return token;
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" });
};

// utils/getUserTimezone.ts
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error("Unable to detect timezone:", error);
    return "UTC"; // fallback
  }
}

import dayjs from "dayjs";

/**
 * Format a given date
 * @param {string|Date|dayjs.Dayjs} date - The date input
 * @param {string} formatStr - The format string (default: "YYYY-MM-DD")
 * @returns {string} Formatted date
 */
export function formatDate(date: string | Date, formatStr = "DD/MM/YYYY") {
  return dayjs(date).format(formatStr);
}

export function formatDateProper(date: Date, locale?: string): string {
  // On the server, fall back to a safe default
  const userLocale =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : locale || "en-CA";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(userLocale, options).format(date);
}

export function formatTo12Hour(date: Date) {
  if (!(date instanceof Date)) {
    date = new Date(date); // allow string or timestamp too
  }

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const minutesStr = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}

export const getTimeAgo = (dateString: string): string => {
  const actionDate = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor(
    (now.getTime() - actionDate.getTime()) / 1000
  );
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds === 1 ? "" : "s"} ago`;
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} hr${diffInHours === 1 ? "" : "s"} ago`;
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "2-digit",
  };

  return actionDate.toLocaleDateString(undefined, options); // Uses browser's locale
};

export const STATUS_PROGRESS: Record<string, string> = {
  BOOKED: "Technician scheduled; awaiting arrival",
  ONGOING: "Work in progress on site",
  COMPLETED: "Repair completed; ready for review",
  DISPUTED: "Customer dispute under investigation",
  CANCELED: "Job canceled; no action needed",
  EXPIRED: "Request expired; needs rebooking",
  COMPLETED_SITE_VISIT: "Site visit finished; awaiting report",
  PENDING: "Awaiting confirmation from customer",
};

export const getProgress = (status: string) =>
  STATUS_PROGRESS[status] ?? "Status unknown";

// lib/statusMeta.ts
export interface StatusMeta {
  header: string;
  report: string;
}

export const STATUS_META: Record<string, StatusMeta> = {
  BOOKED: {
    header: "Job Scheduled",
    report: "Technician scheduled; awaiting arrival",
  },
  ONGOING: {
    header: "Work in Progress",
    report: "Repair currently underway on site",
  },
  COMPLETED: {
    header: "Repair Completed",
    report: "Task finished; pending confirmation",
  },
  DISPUTED: {
    header: "Dispute Raised",
    report: "Issue under review and resolution",
  },
  CANCELED: {
    header: "Job Canceled",
    report: "Request canceled; no further action",
  },
  EXPIRED: {
    header: "Request Expired",
    report: "Job offer expired; rebooking needed",
  },
  COMPLETED_SITE_VISIT: {
    header: "Site Visit Done",
    report: "Inspection finished; awaiting report",
  },
  PENDING: {
    header: "Awaiting Confirmation",
    report: "Job request pending approval",
  },
};

// export const handleHeicFile = async (file: File) => {
//   if (file.type === "image/heic") {
//     const result = await heic2any({ blob: file, toType: "image/jpeg" });

//     // Normalize result: heic2any can return Blob | Blob[]
//     const blob = Array.isArray(result) ? result[0] : result;

//     const convertedFile = new File(
//       [blob],
//       file.name.replace(/\.heic$/i, ".jpg"),
//       { type: "image/jpeg" }
//     );

//     return convertedFile;
//   }
//   return file;
// };
