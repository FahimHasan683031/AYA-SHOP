import { NextFunction, Request, Response } from "express";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { BUSINESS_STATUS, USER_ROLES } from "../../enum/user";
import { User } from "../modules/user/user.model";


export const businessAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user.role === USER_ROLES.BUSINESS) {
            const user = await User.findById(req.user?.authId)
            if (!user) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized to perform this action')
            }



            if (user.business?.businessStatus !== BUSINESS_STATUS.APPROVED) {
                throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your business is not approved yet')
            }

        }

        next()
    } catch (error) {
        next(error)
    }
}