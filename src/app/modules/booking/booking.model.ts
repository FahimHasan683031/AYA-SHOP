import { Schema, model } from "mongoose";
import { IBooking } from "./booking.interface";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../../enum/booking";

const BookingSchema = new Schema<IBooking>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            default: BOOKING_STATUS.REGISTERED,
        },
        reason: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        paymentMethod: {
            type: String,
            enum: ['handCash', 'online'],
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        transactionId: {
            type: String,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Booking = model<IBooking>("Booking", BookingSchema);
