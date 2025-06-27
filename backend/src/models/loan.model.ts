import mongoose, { Document, Schema } from 'mongoose';
import { LOAN_TYPES } from '../utils/constants';

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  loanType: string;
  lender: string;
  principal: number;
  interestRate: number;
  tenure: number; // in months
  emiAmount: number;
  startDate: Date;
  endDate: Date;
  outstandingAmount: number;
  totalPayable: number;
  totalInterest: number;
  paidEMIs: number;
  nextEMIDate?: Date;
  prepayments: Array<{
    date: Date;
    amount: number;
    note?: string;
  }>;
  documents: string[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    loanType: {
      type: String,
      required: [true, 'Loan type is required'],
      enum: Object.values(LOAN_TYPES)
    },
    lender: {
      type: String,
      required: [true, 'Lender name is required'],
      trim: true
    },
    principal: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [0, 'Principal amount must be positive']
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate must be positive']
    },
    tenure: {
      type: Number,
      required: [true, 'Tenure is required'],
      min: [1, 'Tenure must be at least 1 month']
    },
    emiAmount: {
      type: Number,
      required: [true, 'EMI amount is required'],
      min: [0, 'EMI amount must be positive']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    outstandingAmount: {
      type: Number,
      required: [true, 'Outstanding amount is required'],
      min: [0, 'Outstanding amount must be positive']
    },
    totalPayable: {
      type: Number,
      required: true
    },
    totalInterest: {
      type: Number,
      required: true
    },
    paidEMIs: {
      type: Number,
      default: 0,
      min: [0, 'Paid EMIs cannot be negative']
    },
    nextEMIDate: Date,
    prepayments: [{
      date: {
        type: Date,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Prepayment amount must be positive']
      },
      note: String
    }],
    documents: [String],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
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

// Calculate loan details before saving
loanSchema.pre('save', function(next) {
  // Calculate total payable and interest
  const monthlyRate = this.interestRate / 12 / 100;
  const emi = this.principal * monthlyRate * Math.pow(1 + monthlyRate, this.tenure) / 
              (Math.pow(1 + monthlyRate, this.tenure) - 1);
  
  this.emiAmount = Math.round(emi * 100) / 100;
  this.totalPayable = this.emiAmount * this.tenure;
  this.totalInterest = this.totalPayable - this.principal;
  
  // Calculate next EMI date
  if (!this.nextEMIDate && this.startDate) {
    const nextDate = new Date(this.startDate);
    nextDate.setMonth(nextDate.getMonth() + this.paidEMIs + 1);
    this.nextEMIDate = nextDate;
  }
  
  next();
});

// Indexes
loanSchema.index({ userId: 1, isActive: 1 });
loanSchema.index({ userId: 1, loanType: 1 });
loanSchema.index({ userId: 1, nextEMIDate: 1 });

export default mongoose.model<ILoan>('Loan', loanSchema);