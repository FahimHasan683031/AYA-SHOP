import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Secret } from 'jsonwebtoken'
import config from '../../config'
import { jwtHelper } from '../../helpers/jwtHelper'
import ApiError from '../../errors/ApiError'
import { USER_ROLES } from '../../enum/user'
import { User } from '../modules/user/user.model'

const auth =
    (...roles: string[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const tokenWithBearer = req.headers.authorization


                if (!tokenWithBearer) {
                    throw new ApiError(StatusCodes.NOT_FOUND, 'Token not found!')
                }

                if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
                    const token = tokenWithBearer.split(' ')[1]

                    try {
                        // Verify token
                        const verifyUser = jwtHelper.verifyToken(
                            token,
                            config.jwt.jwt_secret as Secret,
                        )

                        const isExistUser = await User.findById(verifyUser.authId)

                        if (!isExistUser) {
                            throw new ApiError(
                                StatusCodes.NOT_FOUND,
                                'User not found!'
                            )
                        }

                        // Set user to header
                        req.user = verifyUser

                        // Guard user
                        if (roles.length && !roles.includes(verifyUser.role)) {
                            throw new ApiError(
                                StatusCodes.FORBIDDEN,
                                "You don't have permission to access this API",
                            )
                        }



                        if (verifyUser.role === USER_ROLES.BUSINESS) {
                            const allowPaths = ['/api/v1/plan', '/api/v1/plan/create-checkout-session/:planId', "/api/v1/auth/add-phone"];

                            const currentPath = (req.baseUrl + req.path).replace(/\/$/, "");

                            const isPathAllowed = (currentPath: string, allowedPaths: string[]) => {
                                return allowedPaths.some(allowedPath => {
                                    const currentSegments = currentPath.split('/').filter(Boolean);
                                    const allowedSegments = allowedPath.split('/').filter(Boolean);

                                    if (currentSegments.length !== allowedSegments.length) return false;

                                    return allowedSegments.every((segment, index) => {
                                        return segment.startsWith(':') || segment === currentSegments[index];
                                    });
                                });
                            };

                            const isAllowed = isPathAllowed(currentPath, allowPaths);


                            const isPendingOnboarding =
                                !isExistUser.subscribe &&
                                !isAllowed;

                            if (isPendingOnboarding) {
                                throw new ApiError(
                                    StatusCodes.FORBIDDEN,
                                    "You don't have permission to access this API",
                                )
                            }
                        }

                        next()
                    } catch (error) {
                        if (error instanceof Error && error.name === 'TokenExpiredError') {
                            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access Token has expired')
                        }
                        next(error)
                    }
                }
            } catch (error) {
                next(error)
            }
        }

export default auth



//this temp auth middleware is created for temporary user verification before creating a new user
//in the future, we will use the auth middleware above

export const tempAuth =
    (...roles: string[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const tokenWithBearer = req.headers.authorization
                console.log('tempAuth tokenWithBearer', req.headers.authorization)
                if (!tokenWithBearer) {
                    throw new ApiError(StatusCodes.NOT_FOUND, 'Token not found!')
                }

                if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
                    const token = tokenWithBearer.split(' ')[1]

                    console.log({ token })

                    try {
                        // Verify token
                        const verifyUser = jwtHelper.verifyToken(
                            token,
                            config.jwt.temp_jwt_secret as Secret,
                        )

                        console.log({ verifyUser })

                        // Set user to header
                        req.user = verifyUser

                        // Guard user
                        if (roles.length && !roles.includes(verifyUser.role)) {
                            throw new ApiError(
                                StatusCodes.FORBIDDEN,
                                "You don't have permission to access this API",
                            )
                        }

                        next()
                    } catch (error) {
                        if (error instanceof Error && error.name === 'TokenExpiredError') {
                            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access Token has expired')
                        }
                        throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid Access Token')
                    }
                }
            } catch (error) {
                next(error)
            }
        }
