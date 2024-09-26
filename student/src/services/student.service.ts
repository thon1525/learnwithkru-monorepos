import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { StudentRepository } from '../database/repositories/student.repository';

@Injectable()
export class StudentService {
  // Imagine this is the repository
  constructor(private readonly studentRepository: StudentRepository) {}

  async Signup(signupData: StudentType): Promise<any> {
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
      return newStudent;
    } catch (error) {
      throw error;
    }
  }
}
