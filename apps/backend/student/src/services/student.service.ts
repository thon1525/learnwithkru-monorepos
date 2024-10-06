import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { StudentRepository } from '../database/repositories/student.repository';

@Injectable()
export class StudentService {
  // Imagine this is the repository
  constructor(private readonly studentRepository: StudentRepository) {}

  async Signup(signupData: StudentType): Promise<{ dataStudent: StudentType }> {
    try {
      // Example logic for creating a student
      const existingStudent = await this.studentRepository.FindByEmail(
        signupData.email,
      );
      if (existingStudent) {
        throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
      }
      // Imagine createStudent is a method that interacts with the database
      const newStudent = await this.studentRepository.create(signupData);

      return {
        dataStudent: newStudent,
      };
    } catch (error) {
      throw error;
    }
  }

  async GetStudent(id: string) {
    try {
      const existingStudentId = await this.studentRepository.FindById(id);
      if (!existingStudentId) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      return existingStudentId;
    } catch (error: unknown) {
      throw error;
    }
  }
  async GetStudentByAuthId(id: string) {
    try {
      const existingStudentId =
        await this.studentRepository.FindByAuthIdStudent(id);
      if (!existingStudentId) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      return existingStudentId;
    } catch (error: unknown) {
      throw error;
    }
  }
  async FindeEmailStudent(email: string) {
    try {
      const existingEmail =
        await this.studentRepository.FindEmailByStudent(email);
      if (!existingEmail) {
        throw new HttpException(
          'Student not found email',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error: unknown) {
      throw error;
    }
  }
}
