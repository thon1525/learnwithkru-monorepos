import mongoose, { Model } from 'mongoose';

interface AuthSignup extends Document {
  firstname: string;
  lastname: string;
  email: string;
  role?: 'USER' | 'STUDENT' | 'TUTOR';
  password?: string;
  is_verified?: boolean;
  googleId?: string;
  picture?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
interface IUserModel extends Model<AuthSignup> {}

const authSchemas = new mongoose.Schema(
  {
    firstname: {
      type: String,
      min: 3,
      max: 25,
      require: true,
    },
    lastname: {
      type: String,
      min: 3,
      max: 25,
      require: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      min: 8,
      max: 35,
    },
    role: { type: String, enum: ['USER', 'STUDENT', 'TUTOR'], default: 'USER' },
    is_verified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    picture: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
export const authModel = mongoose.model<AuthSignup, IUserModel>(
  'auths',
  authSchemas
);
