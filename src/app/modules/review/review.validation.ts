import { z } from "zod";

export const ReviewValidationSchema = z.object({
  body:z.object({
    service: z.string().min(1, 'Service is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().optional(),
  })
})
