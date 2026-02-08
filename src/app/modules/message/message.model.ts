import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import { MESSAGE } from '../../../enum/message';

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Chat',
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    text: {
      type: String,
      required: false
    },
    files: {
      type: [String],
      required: false
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE),
      default: MESSAGE.Text
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
