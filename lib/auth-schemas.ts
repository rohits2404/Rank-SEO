import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().trim().email("Enter a Valid Email Address."),
    password: z.string().min(1, "Enter Your Password."),
});

export const signUpSchema = z.object({
    name: z.string().trim().min(2, "Enter Your Name."),
    email: z.string().trim().email("Enter a Valid Email Address."),
    password: z.string().min(8, "Password Must Be At Least 8 Characters."),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
