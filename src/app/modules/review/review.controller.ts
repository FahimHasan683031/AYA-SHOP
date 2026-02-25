import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { StatusCodes } from 'http-status-codes'


// create review
const createReview = catchAsync(async (req, res) => {
  const payload = req.body
  const result = await ReviewService.createReview(req.user, payload)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review created successfully',
    data: result,
  })
})

// get all reviews
const getAllReviews = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId
  const result = await ReviewService.getAllReviews(serviceId, req.query)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  })
})



// delete review
const deleteReview = catchAsync(async (req, res) => {
  const id = req.params.id
  const result = await ReviewService.deleteReview(req.user, id)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
  })
})


// get business reviews
const getBusinessReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getBusinessReviews(req.user.authId, req.query)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Business reviews retrieved successfully',
    data: result,
  })
})

export const ReviewController = {
  createReview,
  getAllReviews,
  getBusinessReviews,
  deleteReview,
}
