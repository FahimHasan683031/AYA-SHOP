import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { MetaService } from "./meta.service";

const getProviderAnalytics = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await MetaService.getProviderAnalyticsFromDB(user.authId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Provider analytics retrieved successfully",
        data: result,
    });
});

const getPublicStats = catchAsync(async (req: Request, res: Response) => {
    const result = await MetaService.getPublicStatsFromDB();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Public statistics retrieved successfully",
        data: result,
    });
});

export const MetaController = {
    getProviderAnalytics,
    getPublicStats
};
