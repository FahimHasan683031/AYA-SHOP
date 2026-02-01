import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ChatService } from "./chat.service";
import { JwtPayload } from "jsonwebtoken";
import { ADMIN_ROLES } from "../../../enum/user";

const createChat = catchAsync(async (req: Request, res: Response) => {
    const chat = await ChatService.createChatToDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Create Chat Successfully',
        data: chat,
    });
});

const createAdminSupport = catchAsync(async (req: Request, res: Response) => {
    console.log("hit...")
    console.log(req.user.id)
    let chat;
    if (req.user.role === ADMIN_ROLES.ADMIN || req.user.role === ADMIN_ROLES.SUPER_ADMIN) {
        chat = await ChatService.createAdminSupportChat(req.body.participant);
    } else {
        chat = await ChatService.createAdminSupportChat(req.user.authId);
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Admin Support Chat Created Successfully',
        data: chat,
    });
});

const getChat = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatService.getChatFromDB(
        req.user as JwtPayload,
        req.query
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chat Retrieve Successfully',
        data: result.data,
        meta: result.pagination
    });
});

const getAdminSupportChats = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatService.getAdminSupportChats(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Admin Support Chats Retrieved Successfully',
        data: result.data,
        meta: result.pagination
    });
});

const deleteChat = catchAsync(async (req: Request, res: Response) => {
    await ChatService.deleteChatFromDB(req.params.id, req.user.authId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chat Deleted Successfully',
        data: null
    });
});

const getSupportAvailability = catchAsync(async (req: Request, res: Response) => {
    const isAvailable = await ChatService.getSupportAvailability();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Support availability checked successfully',
        data: isAvailable
    });
});

export const ChatController = {
    createChat,
    createAdminSupport,
    getChat,
    getAdminSupportChats,
    deleteChat,
    getSupportAvailability
};