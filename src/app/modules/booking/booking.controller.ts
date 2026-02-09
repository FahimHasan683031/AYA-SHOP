import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.createBookingToDB(req.user.authId, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getAllBookingsFromDB(req.user, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Bookings retrieved successfully",
        meta: result.meta,
        data: result.result,
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.updateBookingStatusInDB(
        req.params.id,
        req.user,
        req.body.status
    );
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking status updated successfully",
        data: result,
    });
});

export const BookingController = {
    createBooking,
    getAllBookings,
    updateBookingStatus,
};
