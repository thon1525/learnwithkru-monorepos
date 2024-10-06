import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IStudentDocs, StudentModel } from '../models/student.model';
import { ApiError } from '../../errors/ApiError';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<IStudentDocs>,
  ) {}

  async create(studentData: StudentType): Promise<IStudentDocs> {
    try {
      const {
        authId,
        lastname,
        firstname,
        email,
        picture,
        schoolName,
        education,
        grade,
        studentCard,
      } = studentData;
      const existingUser = await this.FindByEmail(email);
      if (existingUser) {
        throw new NotFoundException('Student already exists');
      }

      const student = new this.studentModel({
        authId,
        lastname,
        firstname,
        email,
        picture,
        schoolName,
        education,
        grade,
        studentCard,
        role: 'STUDENT',
      });
      return await student.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create student');
    }
  }

  async FindByEmail(email: string): Promise<IStudentDocs | null> {
    try {
      return this.studentModel.findOne({ email: email });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching student');
    }
  }
  async FindById(_id: string): Promise<IStudentDocs | null> {
    try {
      return this.studentModel.findOne({ _id });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching student');
    }
  }

  async FindByAuthIdStudent(authId: string): Promise<IStudentDocs | null> {
    try {
      return this.studentModel.findOne({ authId });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching student');
    }
  }

  async FindEmailByStudent(email: string) {
    try {
      const existingUser = await StudentModel.findOne({
        email: email,
      }).exec();

      return existingUser;
    } catch (error) {
      Logger.error('Unexpected an accurs error: ', error);
      throw new ApiError('Somthing went wrong!');
    }
  }
}
