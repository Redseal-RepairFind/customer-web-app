import Cookies from "js-cookie";

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

export function formatDateProper(date: Date): string {
  const userLocale = navigator.language || "en-US"; // Default to 'en-US' if locale is unavailable
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
