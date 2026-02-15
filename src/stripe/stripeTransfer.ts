import stripe from "../config/stripe";
import { logger } from "../shared/logger";


export const initiateStripeTransfer = async (
  amount: number,
  destinationAccountId: string,
  bookingId: string
) => {
  try {
    // amount is already NET amount in USD (converted before calling)
    const transferAmount = Math.round(amount * 100); // cents

    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: "usd",
      destination: destinationAccountId,
      transfer_group: bookingId,
      description: `Transfer for booking: ${bookingId}`,
      metadata: { bookingId },
    });

    logger.info(`✅ Transfer successful: ${transfer.id} for booking ${bookingId}`);
    return transfer;
  } catch (error) {
    logger.error(`❌ Transfer failed for booking ${bookingId}:`, error);
    throw error;
  }
};
