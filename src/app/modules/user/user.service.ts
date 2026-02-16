import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser } from './user.interface'
import { User } from './user.model'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import QueryBuilder from '../../builder/QueryBuilder'
import config from '../../../config'
import { CategoryModel } from '../category/category.model'


const getAllUser = async (query: Record<string, unknown>) => {
    const userQueryBuilder = new QueryBuilder(User.find().select('-password -authentication'), query)
        .filter()
        .sort()
        .fields()
        .paginate()


    const users = await userQueryBuilder.modelQuery.lean()
    const paginationInfo = await userQueryBuilder.getPaginationInfo()

    const totalUsers = await User.countDocuments()
    const staticData = { totalUsers }

    return {
        users,
        staticData,
        meta: paginationInfo,
    }
}

const getSingleUser = async (id: string) => {
    const result = await User.findById(id).select('-password -authentication')
    return result
}

// delete User
const deleteUser = async (id: string) => {
    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const result = await User.findByIdAndDelete(id)
    return result
}

const updateProfile = async (
    user: JwtPayload,
    payload: Partial<IUser>
) => {
    const isExistUser = await User.findById(user.authId)

    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found or deleted.')
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user.authId, status: { $ne: USER_STATUS.DELETED } },
        payload,
        { new: true },
    )

    if (!updatedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile')
    }

    return updatedUser
}

const getProfile = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId).lean().select('-password -authentication')
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    return isExistUser
}


const deleteMyAccount = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId)
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    await User.findByIdAndDelete(isExistUser._id)

    return 'Account deleted successfully'
}

const insertAdminIntoDB = async () => {
    const admin = await User.findOne({
        role: USER_ROLES.ADMIN,
        email: config.super_admin.email,
    });

    if (!admin) {
        await User.create({
            fullName: config.super_admin.name || "Super Admin",
            email: config.super_admin.email,
            password: config.super_admin.password,
            role: USER_ROLES.ADMIN,
            verified: true,
            status: USER_STATUS.ACTIVE,
            authentication: {
                oneTimeCode: "",
                expiresAt: null,
                latestRequestAt: new Date(),
                requestCount: 0,
                authType: 'createAccount',
                restrictionLeftAt: null,
                resetPassword: false,
                wrongLoginAttempts: 0,
            }
        });
        logger.info('✔ Admin user seeded successfully');
    } else {
        logger.info('ℹ Admin user already exists');
    }
}

const updateBusinessProfile = async (
    user: JwtPayload,
    payload: Partial<IUser['business']>
) => {
    const isExistUser = await User.findById(user.authId).lean()

    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found or deleted.')
    }

    if (payload?.category) {
        const isExistCategory = await CategoryModel.findOne({ _id: payload.category })
        if (!isExistCategory) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found.')
        }
    }

    if (isExistUser.role !== USER_ROLES.BUSINESS) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Only business users can update business profile.')
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user.authId, status: { $ne: USER_STATUS.DELETED } },
        { $set: { business: { ...(isExistUser.business || {}), ...payload } } },
        { new: true },
    )

    if (!updatedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update business profile')
    }

    return updatedUser
}

export const UserServices = {
    updateProfile,
    getAllUser,
    getSingleUser,
    deleteUser,
    getProfile,
    deleteMyAccount,
    insertAdminIntoDB,
    updateBusinessProfile
}
