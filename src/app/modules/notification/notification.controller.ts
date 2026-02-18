import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import { PushNotificationService } from './pushNotification.service';
import { FilterQuery } from 'mongoose';

const getNotificationFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await NotificationService.getNotificationFromDB(req.user, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
    });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const result = await NotificationService.getUnreadCountFromDB(req.user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Unread notification count retrieved successfully',
        data: result
    });
});

const sendTestPushNotification = catchAsync(async (req: Request, res: Response) => {
    const { token, title, body } = req.body;

    const result = await PushNotificationService.sendPushNotification(
        token || "your-device-token",
        title || "Test Notification",
        body || "This is a test notification from the Backend! 🚀",
        {
            screen: "HOME",
            type: "TEST"
        }
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Test notification sent successfully',
        data: result
    });
});

export const NotificationController = {
    getNotificationFromDB,
    getUnreadCount,
    sendTestPushNotification
};
