import { Model, Types } from 'mongoose';

export type INotification = {
    title: string;
    message: string;
    receiver: Types.ObjectId;
    read: boolean;
    referenceId?: Types.ObjectId;
    screen?: string;
    type: "client" | "business" | "admin";
};

export type NotificationModel = Model<INotification>;