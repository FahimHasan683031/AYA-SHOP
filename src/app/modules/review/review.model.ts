import mongoose from "mongoose"
import { IReview } from "./review.interface"

const ReviewSchema = new mongoose.Schema<IReview>({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String
  },
}, {
  timestamps: true,
})

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
