import mongoose, { Document, Schema } from 'mongoose';
import { TRANSACTION_TYPES } from '../utils/constants';

export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    icon: {
      type: String,
      required: [true, 'Icon is required'],
      default: '📌'
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      default: '#6B7280'
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: Object.values(TRANSACTION_TYPES)
    },
    isDefault: {
      type: Boolean,
      default: false
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
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ userId: 1, isActive: 1 });

// Ensure unique category names per user and type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export default mongoose.model<ICategory>('Category', categorySchema);