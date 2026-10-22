import { z } from "zod";

export const visibilitySearchSchema = z.object({
    website: z
        .string()
        .trim()
        .min(1, "Website Is Required")
        .max(500, "Website Is Too Long")
        .refine((value) => {
            try {
                const url = new URL(value);
                return url.protocol === "http:" || url.protocol === "https:";
            } catch {
                return false;
            }
        }, "Enter a Valid URL"),
    brand: z
        .string()
        .trim()
        .min(2, "Use 2+ Characters")
        .max(120, "Brand Is Too Long"),
    topic: z
        .string()
        .trim()
        .min(3, "Use 3+ Characters")
        .max(180, "Topic Is Too Long"),
});

export type VisibilitySearchValues = z.infer<typeof visibilitySearchSchema>;
