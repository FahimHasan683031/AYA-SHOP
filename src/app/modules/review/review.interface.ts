import { Types } from 'mongoose'

export interface IReview {
  _id?: Types.ObjectId
  service: Types.ObjectId
  user: Types.ObjectId
  rating: number
  comment?: string
}
