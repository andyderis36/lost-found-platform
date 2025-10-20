import mongoose, { Document, Schema } from 'mongoose';

export interface IScan extends Document {
  _id: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  scannerName?: string;
  scannerEmail?: string;
  scannerPhone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
  scannedAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required'],
      index: true,
    },
    scannerName: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    scannerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    scannerPhone: {
      type: String,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes for faster queries
ScanSchema.index({ itemId: 1, scannedAt: -1 });

export default mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
