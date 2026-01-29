import { Schema, model } from "mongoose";
import { IService } from "./service.interface";

const ServiceSchema = new Schema<IService>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        maxBookingsPerDay: {
            type: Number,
            required: true,
        },
        photos: {
            type: [String],
            required: true,
            validate: {
                validator: function (v: string[]) {
                    return v.length <= 5;
                },
                message: "A service can have at most 5 photos.",
            },
        },
        features: {
            type: [String],
            default: [],
        },
        clientRequirements: {
            type: String,
            required: true,
        },
        cancellationPolicy: {
            type: String,
            required: true,
        },
        bookingCount: {
            type: Number,
            default: 0,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            total: {
                type: Number,
                default: 0,
            },
            averageRating: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

export const Service = model<IService>("Service", ServiceSchema);
