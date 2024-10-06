import { StudentType, UserPersional } from '@auth/@types/AuthSignup';

export class ResponseData {
  public prepareResponse(
    userData: UserPersional | StudentType
  ): Partial<UserPersional | StudentType> {
    if (userData.role === 'STUDENT') {
      return this.DataStudentResponse(userData as StudentType);
    }

    return this.DataUserResponse(userData as UserPersional);
  }

  private DataUserResponse(
    user: Pick<UserPersional, 'firstname' | 'lastname' | 'email' | 'picture'>
  ): Partial<UserPersional> {
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      picture: user.picture,
    };
  }

  private DataStudentResponse(student: StudentType): Partial<StudentType> {
    return {
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      picture: student.picture,
      schoolName: student.schoolName,
      education: student.education,
      grade: student.grade,
      studentCard: student.studentCard,
    };
  }
}
