import mongoose, { Document, Schema } from 'mongoose';
import { WARRANTY_STATUS } from '../utils/constants';

export interface IWarranty extends Document {
  userId: mongoose.Types.ObjectId;
  productName: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: Date;
  expiryDate: Date;
  price: number;
  seller: string;
  documents: string[];
  notes?: string;
  status: string;
  category?: string;
  remindBeforeDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const warrantySchema = new Schema<IWarranty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    brand: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    serialNumber: {
      type: String,
      trim: true
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    seller: {
      type: String,
      required: [true, 'Seller information is required'],
      trim: true
    },
    documents: [String],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: Object.values(WARRANTY_STATUS),
      default: WARRANTY_STATUS.ACTIVE
    },
    category: String,
    remindBeforeDays: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true
  }
);

// Indexes
warrantySchema.index({ userId: 1, expiryDate: 1 });
warrantySchema.index({ userId: 1, status: 1 });

// Virtual field for calculating status
warrantySchema.pre('save', function(next) {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    this.status = WARRANTY_STATUS.EXPIRED;
  } else if (daysUntilExpiry <= this.remindBeforeDays) {
    this.status = WARRANTY_STATUS.EXPIRING_SOON;
  } else {
    this.status = WARRANTY_STATUS.ACTIVE;
  }
  
  next();
});

export default mongoose.model<IWarranty>('Warranty', warrantySchema);