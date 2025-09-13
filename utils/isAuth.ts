import { cookies } from "next/headers";

const COOKIE_NAME = process.env.NEXT_PUBLIC_TOKEN_COOKIE || "user_token";

export const isToken = async () => (await cookies()).get(COOKIE_NAME);
