import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ServiceService } from "./service.service";

const createService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceService.createServiceToDB((req as any).user._id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service created successfully",
        data: result,
    });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceService.getAllServicesFromDB(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Services retrieved successfully",
        meta: result.meta,
        data: result.result,
    });
});

const getSingleService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceService.getSingleServiceFromDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service retrieved successfully",
        data: result,
    });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceService.updateServiceInDB(req.params.id, (req as any).user._id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service updated successfully",
        data: result,
    });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceService.deleteServiceFromDB(req.params.id, (req as any).user._id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service deleted successfully",
        data: result,
    });
});

const getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
    const result = await ServiceService.getAvailableSlotsFromDB(req.params.id, req.query.date as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Available slots fetched successfully",
        data: result,
    });
});

export const ServiceController = {
    createService,
    getAllServices,
    getSingleService,
    updateService,
    deleteService,
    getAvailableSlots,
};
