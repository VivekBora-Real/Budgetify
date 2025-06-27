import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    currency: string;
    timezone: string;
  };
  preferences: {
    dashboardLayout?: any;
    notifications: {
      email: boolean;
      inApp: boolean;
      reminders: boolean;
    };
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    profile: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
      },
      avatar: String,
      currency: {
        type: String,
        default: 'USD'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    preferences: {
      dashboardLayout: {
        type: Schema.Types.Mixed,
        default: null
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        inApp: {
          type: Boolean,
          default: true
        },
        reminders: {
          type: Boolean,
          default: true
        }
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for email
userSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', userSchema);