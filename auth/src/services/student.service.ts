import { StudentType } from '@auth/@types/AuthSignup';
import { HttpReqStudent } from '@auth/utils/HttpReqStudent';
import { RequestUserService } from '@auth/utils/HttpRequest';
import { logger } from '@auth/utils/logger';

export class StudentServices {
  constructor() {}

  async CreateStudent(dataReq: StudentType, role: string, id: string) {
    const requestUser = new RequestUserService();
    const { DataUser } = await requestUser.GetUserById(id);
    logger.info(`data all ${DataUser.authId}`);

    const {
      lastname,
      firstname,
      email,
      schoolName,
      education,
      grade,
      studentCard,
    } = dataReq;
    const DataStudent = new HttpReqStudent();
    DataStudent.AddStudent();
    try {
    } catch (error: unknown) {
      throw error;
    }
  }
}
