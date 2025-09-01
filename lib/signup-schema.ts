import { z } from "zod";

export const signupSchema = z
  .object({
    number: z.string().min(1, "Number is required"),
    acctType: z.string().optional().default(""),
    businessName: z.string().optional().default(""),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    homeAddress: z.string().optional().default(""),
    eqAge: z.string().optional().default(""),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    subscriptionType: z.string().optional().default(""),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error will be shown on confirmPassword
  });

export type SignupValues = z.infer<typeof signupSchema>;
