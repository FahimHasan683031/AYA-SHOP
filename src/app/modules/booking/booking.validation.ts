import { z } from "zod";

const createBookingSchema = z.object({
    body: z.object({
        service: z.string().min(1, "Service ID is required"),
        date: z.string().min(1, "Date is required"),
        startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
            message: 'Invalid time format. Expected "HH:mm" in 24-hour format.',
        }),
        endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
            message: 'Invalid time format. Expected "HH:mm" in 24-hour format.',
        }),
        notes: z.string().optional(),
    }),
});

const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
    }),
});

export const BookingValidation = {
    createBookingSchema,
    updateBookingStatusSchema,
};
