// student.model.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the student interface extending Document for type safety
export interface IStudentDocs extends Document {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  picture?: string;
  schoolName: string;
  education: string;
  grade: number;
  studentCard?: string;
}

// Define the schema with validation and professional best practices
export const studentSchema = new Schema<IStudentDocs>(
  {
    userId: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      minlength: 2,
      maxlength: 25,
      required: true,
    },
    lastname: {
      type: String,
      minlength: 2,
      maxlength: 25,
      required: true,
    },
    email: {
      type: String,
      minlength: 5,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    picture: {
      type: String,
      default: 'default-picture-url.jpg',
    },
    schoolName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true,
    },
    education: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    studentCard: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const StudentModel = mongoose.model<IStudentDocs>(
  'Student',
  studentSchema,
);
