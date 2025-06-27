import mongoose, { Document, Schema } from 'mongoose';
import { REMINDER_FREQUENCY } from '../utils/constants';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount?: number;
  dueDate: Date;
  frequency: string;
  category?: string;
  isActive: boolean;
  lastNotified?: Date;
  completedDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    amount: {
      type: Number,
      min: [0, 'Amount must be positive']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: Object.values(REMINDER_FREQUENCY)
    },
    category: String,
    isActive: {
      type: Boolean,
      default: true
    },
    lastNotified: Date,
    completedDates: [Date]
  },
  {
    timestamps: true
  }
);

// Indexes
reminderSchema.index({ userId: 1, dueDate: 1, isActive: 1 });
reminderSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IReminder>('Reminder', reminderSchema);