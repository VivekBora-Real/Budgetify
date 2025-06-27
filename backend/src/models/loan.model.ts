import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
  userId: mongoose.Types.ObjectId;
  loanName: string;
  loanType: 'personal' | 'mortgage' | 'auto' | 'student' | 'business' | 'other';
  lender: string;
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: Date;
  endDate: Date;
  nextPaymentDate: Date;
  status: 'active' | 'paid_off' | 'defaulted';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loanName: {
    type: String,
    required: true,
  },
  loanType: {
    type: String,
    enum: ['personal', 'mortgage', 'auto', 'student', 'business', 'other'],
    required: true,
  },
  lender: {
    type: String,
    required: true,
  },
  principalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currentBalance: {
    type: Number,
    required: true,
    min: 0,
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  monthlyPayment: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  nextPaymentDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paid_off', 'defaulted'],
    default: 'active',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ userId: 1, loanType: 1 });
loanSchema.index({ nextPaymentDate: 1 });

export default mongoose.model<ILoan>('Loan', loanSchema);