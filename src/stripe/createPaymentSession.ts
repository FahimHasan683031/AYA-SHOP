import stripe from "../config/stripe";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";

// export const createPaymentSession = async (user: JwtPayload, amount: number, referenceId: string) => {
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: [{
//             price_data: {
//                 currency: 'gbp',
//                 product_data: {
//                     name: 'Payment',
//                     description: `Payment for reference: ${referenceId}`,
//                 },
//                 unit_amount: Math.round(amount * 100),
//             },
//             quantity: 1,
//         }],
//         mode: 'payment',
//         success_url: `${config.stripe.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${config.stripe.frontendUrl}/payment/cancel`,
//         customer_email: user.email,
//         payment_intent_data: {
//             transfer_group: referenceId,
//         },
//         metadata: {
//             userId: user.id || (user as any).authId,
//             referenceId: referenceId
//         },
//     });
//     return session.url;
// };

export const createPaymentSession = async (
  user: JwtPayload,
  amount: number,
  referenceId: string
) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: 'Service Booking',
            description: `Booking reference: ${referenceId}`,
          },
        },
        quantity: 1,
      },
    ],

    payment_intent_data: {
      transfer_group: referenceId,
      metadata: {
        referenceId,
        userId: user.id || (user as any).authId,
      },
    },

    success_url: `${config.stripe.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.stripe.frontendUrl}/payment/cancel`,
  });

  return session.url!;
};