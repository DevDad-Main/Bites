import { z } from "zod";

export const ReviewPostSchema = {
  review: z.string().min(1),
  rating: z.number().min(1).max(5),
};

export type Review = z.infer<typeof ReviewPostSchema>;
