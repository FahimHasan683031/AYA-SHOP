import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import { StripeConnectService } from "./stripeConnect.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import config from "../../../config";
import handleStripeWebhook from "../../../stripe/handleStripeWebhook";
import { NotificationService } from "../notification/notification.service";
import { initiateStripeTransfer } from "../../../stripe/stripeTransfer";
import { logger } from "../../../shared/logger";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.creatSession(req.user!, req.params.bookingId as string);

  res.status(StatusCodes.OK).json({ url: result.url })

})


// create payment
export const createPaymentController = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const payment = await PaymentService.createPayment(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Payment created successfully',
    data: payment,
  });
});

// get payments
export const getPaymentsController = catchAsync(async (req: Request, res: Response) => {
  const payments = await PaymentService.getPayments(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: payments.data,
    meta: payments.meta,
  });
});

// get payment by id
export const getPaymentByIdController = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payment = await PaymentService.getPaymentById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: payment,
  });
});

const initiateStripeConnect = catchAsync(async (req: Request, res: Response) => {
  const result = await StripeConnectService.createAccountLink(req.user.authId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stripe Connect onboarding link generated',
    data: result,
  });
});

const confirmStripeConnect = catchAsync(async (req: Request, res: Response) => {
  const result = await StripeConnectService.verifyOnboarding(req.query.userId as string);

  // Redirect to frontend with success/failure
  const frontendUrl = config.stripe.frontendUrl;
  if (result.success) {
    res.redirect(`${frontendUrl}/stripe-connect/success`);
  } else {
    res.redirect(`${frontendUrl}/stripe-connect/failure`);
  }
});

const checkOnboardingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await StripeConnectService.verifyOnboarding(req.user.authId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Onboarding status retrieved',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  createPaymentController,
  getPaymentsController,
  getPaymentByIdController,
  initiateStripeConnect,
  confirmStripeConnect,
  checkOnboardingStatus,
  handleStripeWebhook,
}
