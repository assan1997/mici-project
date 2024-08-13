import { z } from "zod";

export const signUpUserInfosSchema = z
  .object({
    firstname: z.string(),
    lastname: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password must match",
    path: ["confirmPassword"],
  });

export const signUpEmailSchema = z.object({
  email: z.string().email(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const userInterestSchema = z.object({
  fullName: z.string().max(30, "FullName must be 30 characters maximum"),
  status: z.object({
    id: z.string(),
    title: z.string(),
  }),
  performance: z.string(),
  progression: z.string(),
  learning: z.string(),
});

export type TSignInSchema = z.infer<typeof signInSchema>;
export type TSignUpEmailSchema = z.infer<typeof signUpEmailSchema>;
export type signUpUserInfosSchema = z.infer<typeof signUpUserInfosSchema>;
export type TUserInterestSchema = z.infer<typeof userInterestSchema>;
