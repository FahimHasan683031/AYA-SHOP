import Stripe from 'stripe'
import stripe from '../config/stripe'
import { logger } from '../shared/logger'
import { Payment } from '../app/modules/payment/payment.model'
import { Booking } from '../app/modules/booking/booking.model'
import { BOOKING_STATUS, PAYMENT_STATUS } from '../enum/booking'
import { NotificationService } from '../app/modules/notification/notification.service'
import { Service } from '../app/modules/service/service.model'
import { User } from '../app/modules/user/user.model'

export const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    logger.info('✅ Checkout completed:', session.id)

    const mode = session.mode;
    if (mode === 'payment') {
        // Handle one-time payment
        const paymentIntentId = session.payment_intent as string;

        // Retrieve the PaymentIntent to get the latest charge ID
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        let stripeFee = 0;
        let chargeId = '';

        if (paymentIntent.latest_charge) {
            chargeId = typeof paymentIntent.latest_charge === 'string'
                ? paymentIntent.latest_charge
                : (paymentIntent.latest_charge as Stripe.Charge).id;

            // Retrieve the Charge explicitly expanding the balance_transaction
            const charge = await stripe.charges.retrieve(chargeId, {
                expand: ['balance_transaction']
            });

            const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
            stripeFee = balanceTransaction?.fee || 0;

            logger.info(`💰 Stripe Fee for ${chargeId}: ${stripeFee / 100} ${balanceTransaction?.currency}`);
        } else {
            logger.warn(`⚠️ No latest_charge found for PaymentIntent: ${paymentIntentId}`);
        }

        const referenceId = session.metadata?.referenceId || paymentIntent.metadata?.referenceId;

        const payment = await Payment.create({
            email: session.customer_details?.email,
            amount: (session.amount_total || 0) / 100,
            transactionId: paymentIntentId || session.id,
            dateTime: new Date(),
            customerName: session.customer_details?.name,
            referenceId: referenceId,
        });

        // Update booking status if referenceId points to a booking
        if (referenceId) {
            const booking = await Booking.findById(referenceId);
            if (booking) {
                await Booking.findByIdAndUpdate(referenceId, {
                    $set: {
                        status: BOOKING_STATUS.PENDING,
                        paymentStatus: PAYMENT_STATUS.PAID,
                        transactionId: payment.transactionId,
                        stripeFeeAmount: stripeFee,
                    }
                });

                // --- NOTIFICATIONS ---
                try {
                    const provider = await User.findById(booking.provider).select('fullName');
                    const service = await Service.findById(booking.service).select('name');
                    const serviceName = service?.name || 'Service';

                    // Notify Customer
                    await NotificationService.insertNotification({
                        receiver: booking.user,
                        title: "Payment Successful",
                        message: `Your payment for ${serviceName} was successful. The booking is now pending provider confirmation.`,
                        type: "client",
                        referenceId: booking._id as any,
                    });

                    // Notify Provider
                    await NotificationService.insertNotification({
                        receiver: booking.provider,
                        title: "Booking Paid",
                        message: `A payment has been received for ${serviceName}. Please review the booking.`,
                        type: "business",
                        referenceId: booking._id as any,
                    });
                } catch (err) {
                    logger.error(`Failed to send payment notifications for booking ${referenceId}:`, err);
                }
            }
        }
    }

    // ✅ AUTO-RENEW OFF for subscriptions
    if (session.subscription) {
        await stripe.subscriptions.update(
            session.subscription as string,
            { cancel_at_period_end: true }
        )
    }
}
