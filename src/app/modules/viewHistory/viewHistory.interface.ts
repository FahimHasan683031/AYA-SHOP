import { Types } from "mongoose";

export type IViewHistory = {
    service: Types.ObjectId;
    provider: Types.ObjectId;
    date: string;
    count: number;
};
