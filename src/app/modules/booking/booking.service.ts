import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { Service } from "../service/service.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createBookingToDB = async (userId: string, payload: IBooking) => {
    const service = await Service.findById(payload.service);
    if (!service) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    payload.user = userId as any;
    payload.provider = service.provider;
    payload.totalAmount = service.price;

    const result = await Booking.create(payload);
    return result;
};

const getMyBookingsFromDB = async (userId: string, query: Record<string, unknown>) => {
    const bookingQuery = new QueryBuilder(
        Booking.find({ user: userId }).populate("service provider"),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await bookingQuery.modelQuery;
    const meta = await bookingQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};

const getProviderBookingsFromDB = async (providerId: string, query: Record<string, unknown>) => {
    const bookingQuery = new QueryBuilder(
        Booking.find({ provider: providerId }).populate("service user"),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await bookingQuery.modelQuery;
    const meta = await bookingQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};

const updateBookingStatusInDB = async (id: string, providerId: string, status: string) => {
    const booking = await Booking.findById(id);
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    if (booking.provider.toString() !== providerId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to update this booking");
    }

    const result = await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
    );
    return result;
};

export const BookingService = {
    createBookingToDB,
    getMyBookingsFromDB,
    getProviderBookingsFromDB,
    updateBookingStatusInDB,
};
