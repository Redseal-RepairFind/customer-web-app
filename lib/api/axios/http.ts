// Axios client (browser) with cookie-based auth opt-in
// Usage:
//   await http.get("/public");                     // no token
//   await http.get("/users/me", withAuth());       // attaches Bearer <token>
//   saveToken("..."); clearToken();

import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const TOKEN_COOKIE = process.env.NEXT_PUBLIC_TOKEN_COOKIE!;

type CookieOptions = Parameters<typeof Cookies.set>[2];

const cookieOpts: CookieOptions = {
  expires: 1, // 1 day (tune as needed)
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function saveToken(token: string, days = 7) {
  Cookies.set(TOKEN_COOKIE, token, { ...cookieOpts, expires: days });
}

export function clearToken() {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
}

export function getToken() {
  return Cookies.get(TOKEN_COOKIE) ?? null;
}

/** Helper to mark a request as requiring Authorization */
export function withAuth<T extends object>(config?: T) {
  return {
    ...config,
    headers: { ...(config as any)?.headers, "x-auth": "true" },
  } as T;
}

// ---- Axios instance
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // withCredentials: true, // sends cookies when your API needs them
  timeout: 60000,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// Attach Authorization ONLY when caller opts in via x-auth: true
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const needsAuth = config.headers?.["x-auth"] === "true";
  if (needsAuth) {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${String(
        token
          .replace(/^"(.*)"$/, "$1")
          .trim()
          .replace(/^Bearer\s+/i, "")
      )}`;
    }
    // Remove the hint header before sending to your API
    if (config.headers) delete (config.headers as any)["x-auth"];
  }
  return config;
});

// Optional: normalize 401s or trigger app-level logout
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // e.g., clearToken(); // and maybe route to /login
    }
    return Promise.reject(err);
  }
);
