import express from "express";
import { BookingController } from "./booking.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../user/user.interface";
import validateRequest from "../../middleware/validateRequest";
import { BookingValidation } from "./booking.validation";
import { businessAuth } from "../../middleware/businessAuth";

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
    businessAuth,
    BookingController.getAllBookings
);

router.get(
    "/:id",
    auth(USER_ROLES.CLIENT, USER_ROLES.BUSINESS, USER_ROLES.ADMIN),
    businessAuth,
    BookingController.getSingelBooking
);
router.patch(
    "/:id/status",
    auth(USER_ROLES.BUSINESS, USER_ROLES.CLIENT, USER_ROLES.ADMIN),
    businessAuth,
    validateRequest(BookingValidation.updateBookingStatusSchema),
    BookingController.updateBookingStatus
);
router.delete(
    "/:id",
    auth(USER_ROLES.ADMIN),
    BookingController.deleteBooking
);
export const BookingRoutes = router;
