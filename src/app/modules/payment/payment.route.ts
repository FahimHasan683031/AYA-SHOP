import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
import express from "express";

const router = Router();



router.post(
    "/checkout-session/:bookingId",
    auth(USER_ROLES.CLIENT),
    PaymentController.createCheckoutSession
)

router.post(
    "/stripe-connect",
    auth(USER_ROLES.BUSINESS),
    PaymentController.initiateStripeConnect
)

router.get(
    "/stripe-connect/status",
    auth(USER_ROLES.BUSINESS),
    PaymentController.checkOnboardingStatus
)

router.get(
    "/stripe-connect/refresh",
    PaymentController.confirmStripeConnect
)

router.get(
    "/stripe-connect/return",
    PaymentController.confirmStripeConnect
)

router.get(
    "/",
    auth(USER_ROLES.ADMIN),
    PaymentController.getPaymentsController
)
router.get(
    "/:id",
    auth(USER_ROLES.ADMIN),
    PaymentController.getPaymentByIdController
)



export const PaymentRoutes = router;
