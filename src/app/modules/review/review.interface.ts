import { Types } from 'mongoose'

export interface IReview {
  _id?: Types.ObjectId
  service: Types.ObjectId
  client: Types.ObjectId
  business: Types.ObjectId
  rating: number
  comment?: string
}
