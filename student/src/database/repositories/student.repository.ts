import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IStudentDocs } from '../models/student.model';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<IStudentDocs>,
  ) {}

  async create(studentData: StudentType): Promise<IStudentDocs> {
    try {
      const existingUser = await this.FindByEmail(studentData.email);
      if (existingUser) {
        throw new NotFoundException('Student already exists');
      }

      const student = new this.studentModel(studentData);
      return await student.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create student');
    }
  }

  async FindByEmail(email: string): Promise<IStudentDocs | null> {
    try {
      return this.studentModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching student');
    }
  }
}
