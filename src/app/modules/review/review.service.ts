import { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'
import QueryBuilder from '../../builder/QueryBuilder'
import { IReview } from './review.interface'
import { Review } from './review.model'
import { USER_ROLES } from '../user/user.interface'
import { Service } from '../service/service.model'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'

// create review
const createReview = async (user: JwtPayload, payload: IReview) => {
  payload.user = user.authId

  // Validate service exists
  const serviceExists = await Service.findById(payload.service)
  if (!serviceExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 1. Create the review inside the transaction
    const [review] = await Review.create([payload], { session })

    // 2. Recalculate averageRating and total count via aggregation
    const [stats] = await Review.aggregate([
      { $match: { service: new mongoose.Types.ObjectId(payload.service as any) } },
      {
        $group: {
          _id: '$service',
          averageRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]).session(session)

    // 3. Update the service rating atomically
    await Service.findByIdAndUpdate(
      payload.service,
      {
        $set: {
          'rating.averageRating': parseFloat((stats?.averageRating ?? 0).toFixed(1)),
          'rating.total': stats?.total ?? 0,
        },
      },
      { session }
    )

    await session.commitTransaction()
    return review
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// get all reviews
const getAllReviews = async (query: Record<string, unknown>) => {
  const reviewQueryBuilder = new QueryBuilder(Review.find(), query)
    .filter()
    .sort()
    .fields()
    .paginate()

  const reviews = await reviewQueryBuilder.modelQuery
  const paginationInfo = await reviewQueryBuilder.getPaginationInfo()

  return {
    reviews,
    meta: paginationInfo,
  }
}



// delete review
const deleteReview = async (user: JwtPayload, id: string) => {
  const isExist = await Review.findById(id)
  if (!isExist) {
    throw new Error('Review not found')
  }
  if (user.role !== USER_ROLES.ADMIN && isExist.user !== user.authId) {
    throw new Error('You are not authorized to delete this review')
  }
  const result = await Review.findByIdAndDelete(id)
  return result
}

export const ReviewService = {
  createReview,
  getAllReviews,
  deleteReview,
}
