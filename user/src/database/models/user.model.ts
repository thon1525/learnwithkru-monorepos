import { UserTypes } from '@user/@types/UserTyps';
import mongoose from 'mongoose';

export interface IUserDoc extends UserTypes, Document {}

const userSchemas = new mongoose.Schema({
  authId: {
    type: String,
  },
  firstname: {
    type: String,
    min: 2,
    max: 25,
    require: true,
  },
  lastname: {
    type: String,
    min: 2,
    max: 25,
    require: true,
  },
  role: { type: String, enum: ['USER', 'STUDENT', 'TUTOR'], default: 'USER' },
  email: {
    type: String,
    min: 2,
  },
  picture: {
    type: String,
  },
});

export const UserModel = mongoose.model<IUserDoc>('users', userSchemas);
