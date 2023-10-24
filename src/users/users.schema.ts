import { Schema, Document, model } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  isVerified: boolean;
  role: string;
  forgotPasswordToken: string;
  forgotPasswordExpiry: Date;
}

export const UserSchema = new Schema<User>(
  {
    email: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Event Organizer', 'Exhibitor', 'Visitor'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: { type: String },
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<User>('User', UserSchema);
