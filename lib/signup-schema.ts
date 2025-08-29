import { z } from "zod";

// helper: treat empty strings as "not provided"
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const signupSchema = z
  .object({
    acctType: z.preprocess(
      emptyToUndefined,
      z.string().min(1, "Select an account type").optional()
    ),
    businessName: z.preprocess(
      emptyToUndefined,
      z.string().min(2, "Business name is too short").optional()
    ),

    firstName: z
      .string({ required_error: "First name is required" })
      .min(2, "First name is too short"),

    lastName: z
      .string({ required_error: "Last name is required" })
      .min(2, "Last name is too short"),

    email: z
      .string({ required_error: "Email is required" })
      .email("Enter a valid email"),

    number: z
      .string({ required_error: "Phone number is required" })
      .refine(
        (v) => /^\d{7,14}$/.test((v || "").replace(/\D/g, "")),
        "Enter a valid phone number"
      ),

    // ⬇️ now NOT required; validates only if provided
    homeAddress: z.preprocess(
      emptyToUndefined,
      z.string().min(3, "Enter a valid address").optional()
    ),

    // ⬇️ now NOT required; validates only if provided
    eqAge: z.preprocess(
      emptyToUndefined,
      z.string().min(1, "Select equipment age").optional()
    ),

    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/\d/, "Add at least one number")
      .regex(/[^A-Za-z0-9]/, "Add at least one special character"),

    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;
