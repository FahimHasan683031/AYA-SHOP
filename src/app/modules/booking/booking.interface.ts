import { Types } from "mongoose";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../../../enum/booking";

export type IBooking = {
    user: Types.ObjectId;
    service: Types.ObjectId;
    provider: Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
    status: BOOKING_STATUS;
    paymentStatus: PAYMENT_STATUS;
    paymentMethod: 'handCash' | 'online';
    totalAmount: number;
    stripeFeeAmount?: number;
    isTransferred?: boolean;
    transactionId?: string;
    reason?: string;
    notes?: string;
};
