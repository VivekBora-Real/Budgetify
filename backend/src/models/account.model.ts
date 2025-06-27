import mongoose, { Document, Schema } from 'mongoose';
import { ACCOUNT_TYPES } from '../utils/constants';

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [50, 'Account name cannot exceed 50 characters']
    },
    type: {
      type: String,
      required: [true, 'Account type is required'],
      enum: Object.values(ACCOUNT_TYPES)
    },
    balance: {
      type: Number,
      required: [true, 'Balance is required'],
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    color: {
      type: String,
      default: '#4F46E5'
    },
    icon: String,
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
accountSchema.index({ userId: 1, isActive: 1 });
accountSchema.index({ userId: 1, type: 1 });

export default mongoose.model<IAccount>('Account', accountSchema);