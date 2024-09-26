import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  Injectable,
} from '@nestjs/common';
import { PATH_STUDENT } from '../path/path-defs';
import { StudentService } from '../services/student.service';

@Injectable()
@Controller('v1/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  @Post(PATH_STUDENT.SIGNUP)
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupBody: StudentType): Promise<any> {
    try {
      // Delegate to service
      Logger.log(`req body ${signupBody.email}`);
      const result = await this.studentService.Signup(signupBody);
      return { message: 'Signup successful', data: result };
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
}
