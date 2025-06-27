import mongoose, { Document, Schema } from 'mongoose';
import { TRANSACTION_TYPES } from '../utils/constants';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  category: string;
  tags: string[];
  description: string;
  date: Date;
  attachments: string[];
  isRecurring: boolean;
  recurringDetails?: {
    frequency: string;
    endDate?: Date;
    parentTransactionId?: mongoose.Types.ObjectId;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: Object.values(TRANSACTION_TYPES)
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    tags: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    attachments: [String],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringDetails: {
      frequency: String,
      endDate: Date,
      parentTransactionId: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
      }
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, accountId: 1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ tags: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);