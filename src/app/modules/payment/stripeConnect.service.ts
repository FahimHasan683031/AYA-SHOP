import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const createConnectAccount = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || user.role !== 'business') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Only business users can create a Stripe Connect account");
    }

    if (user.business?.stripeAccountId) {
        return { stripeAccountId: user.business.stripeAccountId };
    }

    const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB', // Default to GB based on gbp currency in createPaymentSession
        email: user.email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { userId: user._id.toString() }
    });

    await User.findByIdAndUpdate(userId, {
        $set: { 'business.stripeAccountId': account.id }
    });

    return { stripeAccountId: account.id };
};

const createAccountLink = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || !user.business?.stripeAccountId) {
        const { stripeAccountId } = await createConnectAccount(userId);
        var accountId = stripeAccountId;
    } else {
        var accountId = user.business.stripeAccountId;
    }

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${config.backend_url}/api/v1/payment/stripe-connect/refresh?userId=${userId}`,
        return_url: `${config.backend_url}/api/v1/payment/stripe-connect/return?userId=${userId}`,
        type: 'account_onboarding',
    });

    return { url: accountLink.url };
};

const verifyOnboarding = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || !user.business?.stripeAccountId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Stripe account not found");
    }

    const account = await stripe.accounts.retrieve(user.business.stripeAccountId);

    const status = {
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        is_connected: true
    };

    if (account.charges_enabled && account.details_submitted) {
        await User.findByIdAndUpdate(userId, {
            $set: { 'business.stripeOnboardingCompleted': true }
        });
    } else {
        await User.findByIdAndUpdate(userId, {
            $set: { 'business.stripeOnboardingCompleted': false }
        });
    }

    return {
        success: true,
        message: "Account status retrieved",
        data: status
    };
};

export const StripeConnectService = {
    createConnectAccount,
    createAccountLink,
    verifyOnboarding
};
