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

export const setCookie = (name: string, item: any) => {
  Cookies.set(name, item, {
    expires: 7,
    path: "/",
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
  });
};

export const readCookie = (name: string) => {
  const token = Cookies.get(name); // string | undefined

  return token && JSON?.parse(token as string);
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
