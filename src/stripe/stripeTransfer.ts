import stripe from "../config/stripe";
import { logger } from "../shared/logger";

/**
 * Transfers funds from the platform account to a connected business account.
 * @param amount Total amount in original currency (e.g., 100.00)
 * @param destinationAccountId The Stripe account ID of the business
 * @param bookingId Reference ID for the booking
 * @returns Stripe Transfer object
 */
export const initiateStripeTransfer = async (amount: number, destinationAccountId: string, bookingId: string) => {
    try {
        // Calculate 90% for the business
        const businessAmount = Math.round(amount * 0.9 * 100); // Convert to cents

        const transfer = await stripe.transfers.create({
            amount: businessAmount,
            currency: 'gbp',
            destination: destinationAccountId,
            description: `Transfer for booking: ${bookingId}`,
            metadata: { bookingId }
        });

        logger.info(`✅ Transfer successful: ${transfer.id} for booking ${bookingId}`);
        return transfer;
    } catch (error) {
        logger.error(`❌ Transfer failed for booking ${bookingId}:`, error);
        throw error;
    }
};
