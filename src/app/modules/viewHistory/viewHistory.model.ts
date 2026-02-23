import { Schema, model } from "mongoose";
import { IViewHistory } from "./viewHistory.interface";

const ViewHistorySchema = new Schema<IViewHistory>(
    {
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        count: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to quickly find/update daily views for a service
ViewHistorySchema.index({ service: 1, date: 1 }, { unique: true });
ViewHistorySchema.index({ provider: 1, date: 1 });

export const ViewHistory = model<IViewHistory>("ViewHistory", ViewHistorySchema);
