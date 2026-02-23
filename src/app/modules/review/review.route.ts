import express from 'express'
import { ReviewController } from './review.controller'
import validateRequest from '../../middleware/validateRequest'
import { ReviewValidationSchema } from './review.validation'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../user/user.interface'

const router = express.Router()

router.post(
  '/',
  validateRequest(ReviewValidationSchema),
  auth(USER_ROLES.CLIENT),
  ReviewController.createReview,
)

router.get('/:serviceId', ReviewController.getAllReviews)
router.delete('/:id', auth(USER_ROLES.CLIENT, USER_ROLES.ADMIN), ReviewController.deleteReview)


export const ReviewRoutes = router
