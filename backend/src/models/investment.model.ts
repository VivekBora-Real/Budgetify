import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etf' | 'crypto' | 'real_estate' | 'other';
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  broker: string;
  notes?: string;
  currency: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['stocks', 'bonds', 'mutual_funds', 'etf', 'crypto', 'real_estate', 'other'],
    required: true,
  },
  symbol: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  broker: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

investmentSchema.index({ userId: 1, type: 1 });
investmentSchema.index({ userId: 1, symbol: 1 });

export default mongoose.model<IInvestment>('Investment', investmentSchema);