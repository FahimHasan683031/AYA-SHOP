import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IService } from "./service.interface";
import { Service } from "./service.model";
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

export const ServiceService = {
    createServiceToDB,
    getAllServicesFromDB,
    getSingleServiceFromDB,
    updateServiceInDB,
    deleteServiceFromDB,
};
