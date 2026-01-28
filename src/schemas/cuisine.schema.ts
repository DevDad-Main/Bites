import { z } from "zod";

export const ReviewPostSchema = z.object({
  review: z.string().min(1),
  rating: z.number().min(1).max(10),
});

export type Review = z.infer<typeof ReviewPostSchema>;
