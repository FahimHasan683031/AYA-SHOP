import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.createBookingToDB((req as any).user._id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getMyBookingsFromDB((req as any).user._id, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "My bookings retrieved successfully",
        meta: result.meta,
        data: result.result,
    });
});

const getProviderBookings = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getProviderBookingsFromDB((req as any).user._id, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Provider bookings retrieved successfully",
        meta: result.meta,
        data: result.result,
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.updateBookingStatusInDB(
        req.params.id,
        (req as any).user._id,
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
    getMyBookings,
    getProviderBookings,
    updateBookingStatus,
};
