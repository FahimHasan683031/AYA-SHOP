import Stripe from 'stripe'
import { User } from '../app/modules/user/user.model'
import { Subscription } from '../app/modules/subscription/subscription.model'
import { logger } from '../shared/logger'
import { handleSubscriptionCreated } from './handleSubscriptionCreated'

export const handleSubscriptionEvents = {
    created: async (subscription: Stripe.Subscription) => {
        await handleSubscriptionCreated(subscription)
    },
    updated: async (subscription: Stripe.Subscription) => {
        if (
            subscription.cancel_at_period_end &&
            subscription.status === 'active'
        ) {
            logger.info(
                `Subscription for user ${subscription.metadata.userId} will expire`,
            )

            await User.findByIdAndUpdate(subscription.metadata.userId, {
                subscribe: false,
            })

            await Subscription.findOneAndUpdate(
                { user: subscription.metadata.userId },
                { status: 'expired' },
            )
        }
    },
    deleted: async (subscription: Stripe.Subscription) => {
        await User.findByIdAndUpdate(subscription.metadata.userId, {
            subscribe: false,
        })

        await Subscription.findOneAndUpdate(
            { user: subscription.metadata.userId },
            { status: 'expired' },
        )
    }
}
