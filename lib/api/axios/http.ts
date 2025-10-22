// lib/api/axios/http.ts
// Axios client (browser) with cookie-based auth opt-in
import "client-only";
import axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const TOKEN_COOKIE = process.env.NEXT_PUBLIC_TOKEN_COOKIE!;

type CookieOptions = Parameters<typeof Cookies.set>[2];

const cookieOpts: CookieOptions = {
  expires: 1,
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

/** Mark a request as requiring Authorization */
export function withAuth(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);
  headers.set("x-auth", "true");
  return { ...config, headers };
}

// ---- Axios instance
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 60000,
  headers: new AxiosHeaders({ "X-Requested-With": "XMLHttpRequest" }),
});

// Attach Authorization ONLY when caller opts in via x-auth: true
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  const needsAuth = headers.get("x-auth") === "true";
  if (needsAuth) {
    const token = getToken();
    if (token) {
      const clean = String(token)
        .replace(/^"(.*)"$/, "$1")
        .trim()
        .replace(/^Bearer\s+/i, "");
      headers.set("Authorization", `Bearer ${clean}`);
    }
    // remove the hint header before sending
    headers.delete("x-auth");
  }

  config.headers = headers; // keep as AxiosHeaders
  return config;
});

// Optional: normalize 401s or trigger app-level logout
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clearToken(); // maybe redirect to /login
    }
    return Promise.reject(err);
  }
);
