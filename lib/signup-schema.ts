import { z } from "zod";

export const signupSchema = z
  .object({
    number: z.string().optional(),
    acctType: z.string().optional().default(""),
    businessName: z.string().optional().default(""),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    homeAddress: z.string().optional().default(""),
    eqAge: z.string().optional().default(""),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((v) => (v.password ?? "") === (v.confirmPassword ?? ""), {
    path: ["confirmPassword"],
    message: "Passwords must match",
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;
