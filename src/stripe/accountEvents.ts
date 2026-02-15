import Stripe from 'stripe';
import { Booking } from '../app/modules/booking/booking.model';
import { logger } from '../shared/logger';
import { PAYMENT_STATUS } from '../enum/booking';

export const handleTransferCreated = async (transfer: Stripe.Transfer) => {
    const bookingId = transfer.metadata?.bookingId || transfer.transfer_group;
    if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
            $set: { isTransferred: true }
        });
        logger.info(`✅ Booking ${bookingId} marked as transferred via webhook.`);
    }
};

export const handleChargeRefunded = async (charge: Stripe.Charge) => {
    const bookingId = charge.metadata?.bookingId;
    if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
            $set: { paymentStatus: PAYMENT_STATUS.REFUNDED }
        });
        logger.info(`ℹ️ Charge refunded for booking ${bookingId}`);
    }
};
