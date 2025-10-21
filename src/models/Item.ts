import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  qrCode: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customFields?: Record<string, any>;
  status: 'active' | 'lost' | 'found' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    qrCode: {
      type: String,
      required: [true, 'QR Code is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Personal Items',
        'Bags & Luggage',
        'Jewelry',
        'Documents',
        'Keys',
        'Sports Equipment',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      trim: true,
    },
    customFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['active', 'lost', 'found', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (qrCode already indexed via unique: true)
ItemSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
