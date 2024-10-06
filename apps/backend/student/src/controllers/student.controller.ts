import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  Injectable,
  Param,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PATH_STUDENT } from '../path/path-defs';
import { StudentService } from '../services/student.service';

@Injectable()
@Controller('v1/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  @Post(PATH_STUDENT.SIGNUP)
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() signupBody: StudentType,
  ): Promise<{ message: string; DataStudent: StudentType }> {
    try {
      // Delegate to service
      const DataStuent = await this.studentService.Signup(signupBody);
      return {
        message: 'Signup successful',
        DataStudent: DataStuent.dataStudent,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Signup failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(PATH_STUDENT.GETBYSTUDENTID)
  @HttpCode(HttpStatus.OK)
  async GetStudentById(
    @Param('studentId') studentId: string,
  ): Promise<{ Datastuden: StudentType }> {
    try {
      const DataStudent = await this.studentService.GetStudent(studentId);

      return {
        Datastuden: DataStudent,
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  @Get(PATH_STUDENT.GETBYSTUDENTAUTHID)
  @HttpCode(HttpStatus.OK)
  async GetStudentByAuthId(
    @Param('authId') authId: string,
  ): Promise<{ Datastuden: StudentType }> {
    try {
      const DataStudent = await this.studentService.GetStudentByAuthId(authId);
      return {
        Datastuden: DataStudent,
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  @Get(PATH_STUDENT.GETEMAILSTUDENT)
  @HttpCode(HttpStatus.OK)
  async GetStudentByemail(@Param('email') email: string) {
    try {
      Logger.log(`email : ${email}`);
      const DataStudent = await this.studentService.FindeEmailStudent(email);
      if (!email) {
        throw new BadRequestException('Email are required');
      }
    } catch (error: unknown) {
      throw error;
    }
  }
}
