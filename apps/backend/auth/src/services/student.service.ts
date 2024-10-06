import { Student, StudentType, UserTypes } from '@auth/@types/AuthSignup';
import { AuthRepository } from '@auth/database/repositories/auth.respository';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { HttpReqStudent } from '@auth/utils/HttpReqStudent';
import { RequestUserService } from '@auth/utils/HttpRequest';
import { generateSignature } from '@auth/utils/jwt';
import { logger } from '@auth/utils/logger';
import { StatusCode } from '@auth/utils/StatusCode';

export class StudentServices {
  private AuthRepo: AuthRepository;
  constructor() {
    this.AuthRepo = new AuthRepository();
  }

  async CreateStudent(
    dataReq: Student,
    role: string,
    id: string
  ): Promise<{ DataStuent: StudentType; token: string }> {
    try {
      const requestUser = new RequestUserService();
      const Student = new HttpReqStudent();
      logger.info(`Data student: ${id}`);

      const { DataUser } = await requestUser.GetUserById(id);

      const { schoolName, education, grade, studentCard } = dataReq;

      const InformationStudnt: StudentType = {
        authId: DataUser.authId,
        lastname: DataUser.lastname,
        firstname: DataUser.firstname,
        email: DataUser.email,
        picture: DataUser.picture,
        schoolName: schoolName,
        education: education,
        grade: grade,
        studentCard: studentCard,
        role: DataUser.role,
        _id: DataUser._id,
      };

      const { DataStudent } = await Student.AddStudent(InformationStudnt, role);
      await requestUser.RemoveUserById(DataUser._id);
      logger.info(`role data currect ${DataStudent.role}`);
      await this.AuthRepo.FindAuthByIdRole(DataUser.authId, DataStudent.role);
      const jwtToken = await generateSignature({
        _id: DataStudent._id as string,
        role: DataStudent.role as string,
      });
      return {
        DataStuent: DataStudent,
        token: jwtToken,
      };
    } catch (error: unknown) {
      throw error;
    }
  }
}
