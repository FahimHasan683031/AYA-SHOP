import express from "express";
import { BookingController } from "./booking.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { BookingValidation } from "./booking.validation";

const router = express.Router();

router.post(
    "/",
    auth(USER_ROLES.CLIENT),
    validateRequest(BookingValidation.createBookingSchema),
    BookingController.createBooking
);

router.get(
    "/",
    auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
    BookingController.getAllBookings
);

router.patch(
    "/:id/status",
    auth(USER_ROLES.BUSINESS),
    validateRequest(BookingValidation.updateBookingStatusSchema),
    BookingController.updateBookingStatus
);

export const BookingRoutes = router;
