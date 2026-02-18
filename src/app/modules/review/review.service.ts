import { JwtPayload } from 'jsonwebtoken'
import QueryBuilder from '../../builder/QueryBuilder'
import { IReview } from './review.interface'
import { Review } from './review.model'
import { USER_ROLES } from '../user/user.interface'

// create review
const createReview = async (user: JwtPayload, payload: IReview) => {
payload.user = user.authId
  const result = await Review.create(payload)
  return result
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
  if(user.role !== USER_ROLES.ADMIN && isExist.user !== user.authId){
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
