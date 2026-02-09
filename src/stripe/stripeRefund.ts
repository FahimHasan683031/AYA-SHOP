import stripe from "../config/stripe";
import { logger } from "../shared/logger";

/**
 * Initiates a full refund for a payment intent.
 * @param paymentIntentId The transaction ID (Payment Intent ID) to refund
 * @param bookingId Reference ID for the booking
 * @returns Stripe Refund object
 */
export const initiateStripeRefund = async (paymentIntentId: string, bookingId: string) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            metadata: { bookingId }
        });

        logger.info(`✅ Refund successful: ${refund.id} for booking ${bookingId}`);
        return refund;
    } catch (error) {
        logger.error(`❌ Refund failed for booking ${bookingId}:`, error);
        throw error;
    }
};
