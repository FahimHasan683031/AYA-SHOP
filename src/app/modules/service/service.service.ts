import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IService } from "./service.interface";
import { Service } from "./service.model";
import { Booking } from "../booking/booking.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createServiceToDB = async (providerId: string, payload: IService) => {
    payload.provider = providerId as any;
    const result = await Service.create(payload);
    return result;
};

const getAllServicesFromDB = async (query: Record<string, unknown>) => {
    const serviceQuery = new QueryBuilder(Service.find().populate("category provider"), query)
        .search(["name", "description"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await serviceQuery.modelQuery;
    const meta = await serviceQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};

const getSingleServiceFromDB = async (id: string) => {
    const result = await Service.findById(id).populate("category provider");
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }
    return result;
};

const updateServiceInDB = async (id: string, providerId: string, payload: Partial<IService>) => {
    const isExist = await Service.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    if (isExist.provider.toString() !== providerId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to update this service");
    }

    const result = await Service.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteServiceFromDB = async (id: string, providerId: string) => {
    const isExist = await Service.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    if (isExist.provider.toString() !== providerId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to delete this service");
    }

    const result = await Service.findByIdAndDelete(id);
    return result;
};

const getAvailableSlotsFromDB = async (serviceId: string, date: string) => {
    const service = await Service.findById(serviceId).populate("provider");
    if (!service) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    const provider = service.provider as any;
    if (!provider || !provider.business || !provider.business.businessHours) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Provider business hours not configured");
    }

    const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const businessHours = (provider.business.businessHours as any)[dayOfWeek];

    if (!businessHours || !businessHours.from || !businessHours.to) {
        return []; // Closed on this day
    }

    // Parse duration (e.g., "30 min", "1 hour", or just "30")
    const durationMatch = service.duration.match(/\d+/);
    const durationInMinutes = durationMatch ? parseInt(durationMatch[0]) : 30;

    const slots = [];
    let current = businessHours.from;
    const end = businessHours.to;

    const parseTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const formatTime = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    let currentMinutes = parseTime(current);
    const endMinutes = parseTime(end);

    while (currentMinutes + durationInMinutes <= endMinutes) {
        const slotFrom = formatTime(currentMinutes);
        const slotTo = formatTime(currentMinutes + durationInMinutes);

        // Check availability in Booking model
        const isBooked = await Booking.findOne({
            service: serviceId,
            date,
            startTime: slotFrom,
            status: { $ne: "cancelled" },
        });

        slots.push({
            from: slotFrom,
            to: slotTo,
            status: isBooked ? "booked" : "available",
        });

        currentMinutes += durationInMinutes;
    }

    return slots;
};

export const ServiceService = {
    createServiceToDB,
    getAllServicesFromDB,
    getSingleServiceFromDB,
    updateServiceInDB,
    deleteServiceFromDB,
    getAvailableSlotsFromDB,
};
