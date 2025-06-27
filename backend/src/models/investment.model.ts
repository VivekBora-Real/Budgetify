import mongoose, { Document, Schema } from 'mongoose';
import { INVESTMENT_TYPES } from '../utils/constants';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  startDate: Date;
  maturityDate?: Date;
  interestRate?: number;
  returns: number;
  returnPercentage: number;
  institution: string;
  accountNumber?: string;
  notes?: string;
  isActive: boolean;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Investment name is required'],
      trim: true,
      maxlength: [100, 'Investment name cannot exceed 100 characters']
    },
    type: {
      type: String,
      required: [true, 'Investment type is required'],
      enum: Object.values(INVESTMENT_TYPES)
    },
    investedAmount: {
      type: Number,
      required: [true, 'Invested amount is required'],
      min: [0, 'Invested amount must be positive']
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Current value must be positive']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    maturityDate: Date,
    interestRate: {
      type: Number,
      min: [0, 'Interest rate must be positive']
    },
    returns: {
      type: Number,
      default: 0
    },
    returnPercentage: {
      type: Number,
      default: 0
    },
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    documents: [String]
  },
  {
    timestamps: true
  }
);

// Calculate returns before saving
investmentSchema.pre('save', function(next) {
  this.returns = this.currentValue - this.investedAmount;
  this.returnPercentage = this.investedAmount > 0 
    ? ((this.currentValue - this.investedAmount) / this.investedAmount) * 100 
    : 0;
  next();
});

// Indexes
investmentSchema.index({ userId: 1, type: 1 });
investmentSchema.index({ userId: 1, isActive: 1 });
investmentSchema.index({ userId: 1, maturityDate: 1 });

export default mongoose.model<IInvestment>('Investment', investmentSchema);