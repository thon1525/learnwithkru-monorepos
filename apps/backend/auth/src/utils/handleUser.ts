import { StudentType, UserPersional } from '@auth/@types/AuthSignup';
import { logger } from './logger';
import { StatusCode } from './StatusCode';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { HttpReqStudent } from './HttpReqStudent';
import { RequestUserService } from './HttpRequest';

export class HandleUser {
  private requestUserService = new RequestUserService();
  private studentService = new HttpReqStudent();

  /**
   * Retrieves user data based on the role.
   * @param id - User ID
   * @param role - User role
   * @returns User data or null if not found
   */
  public async getUserDataByRole(
    id: string,
    role: string
  ): Promise<UserPersional | StudentType | null> {
    switch (role) {
      case 'USER':
        return await this.getUserById(id);

      case 'STUDENT':
        return await this.getStudentById(id);

      case 'TUTOR':
        // Implement TUTOR logic when needed
        logger.warn(`TUTOR role not implemented for user ID: ${id}`);
        return null;

      default:
        logger.error(`Invalid role provided: ${role}`);
        throw new BaseCustomError('Invalid role', StatusCode.BadRequest);
    }
  }

  /**
   * Fetches user data for the USER role.
   * @param id - User ID
   * @returns User data or null if not found
   */
  private async getUserById(id: string): Promise<UserPersional | null> {
    const { DataUser } = await this.requestUserService.GetUserById(id);
    return DataUser || null;
  }

  /**
   * Fetches student data for the STUDENT role.
   * @param id - Student ID
   * @returns Student data or null if not found
   */
  private async getStudentById(id: string): Promise<StudentType | null> {
    const { DataStuent } = await this.studentService.GetStudentById(id);
    return DataStuent;
  }
}
