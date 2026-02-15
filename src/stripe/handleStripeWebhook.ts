import { Request, Response } from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import config from '../config'
import stripe from '../config/stripe'
import ApiError from '../errors/ApiError'
import { logger } from '../shared/logger'
import { handleCheckoutSessionCompleted } from './checkoutPaymentEvents'
import { handleSubscriptionEvents } from './subscriptionEvents'
import { handleChargeRefunded, handleTransferCreated } from './accountEvents'

const handleStripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = config.stripe.webhookSecret as string
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (error) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Webhook verification failed: ${error}`,
        )
    }

    const data = event.data.object as any
    const eventType = event.type

    try {
        switch (eventType) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(data as Stripe.Checkout.Session)
                break

            case 'customer.subscription.created':
                await handleSubscriptionEvents.created(data as Stripe.Subscription)
                break

            case 'customer.subscription.updated':
                await handleSubscriptionEvents.updated(data as Stripe.Subscription)
                break

            case 'customer.subscription.deleted':
                await handleSubscriptionEvents.deleted(data as Stripe.Subscription)
                break

            case 'transfer.created':
                await handleTransferCreated(data as Stripe.Transfer)
                break

            case 'charge.refunded':
                await handleChargeRefunded(data as Stripe.Charge)
                break

            default:
                logger.info(`⚠️ Unhandled event type: ${eventType}`)
        }
    } catch (error) {
        logger.error('Webhook error:', error)
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `${error}`)
    }

    res.sendStatus(200)
}

export default handleStripeWebhook
