import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Recipient
  itemId: mongoose.Types.ObjectId; // Lost/Found item
  type: 'item_scanned' | 'item_found' | 'item_claimed' | 'message' | 'system';
  title: string;
  message: string;
  data?: {
    qrCode?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    scannerName?: string;
    scannerEmail?: string;
    timestamp?: Date;
    [key: string]: any;
  };
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['item_scanned', 'item_found', 'item_claimed', 'message', 'system'],
      default: 'system',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Index for cleanup old notifications
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
