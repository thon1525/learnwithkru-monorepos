import { StudentType } from '@auth/@types/AuthSignup';
import { logger } from './logger';
import { PATH_SERVICE } from '@auth/routes/pathDdefs';
import { getConfig } from './createConfig';
import { ApiError } from '@auth/errors/ApiError';
import axios from 'axios';

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
export class HttpReqStudent {
  async AddStudent(DataStuent: StudentType, role: string) {
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
      } = DataStuent;
      const url = `${config.studentService}${PATH_SERVICE.STUDENT.SIGNUSTUDENT}`;
      logger.info(`Attempting to create user at URL: ${url} `);

      const res = await axios.post(
        url,
        {
          authId,
          firstname,
          lastname,
          email,
          picture,
          role,
          schoolName,
          education,
          grade,
          studentCard,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.data) {
        throw new ApiError('User service did not return data.');
      }
      logger.info(`data has data feth:  ${res.data.DataStudent.email}`);
      return res.data;
    } catch (error: unknown) {
      logger.error(`error data fetching ok Data ${error}`);
      throw error;
    }
  }

  async GetStudentByAuthId(
    authId: string
  ): Promise<{ DataStuent: StudentType }> {
    const url = `${config.studentService}${PATH_SERVICE.STUDENT.GETBYSTUDENT}/${authId}`;
    logger.info(
      `Attempting to create user at URL: ${url} has ${config.studentService}`
    );
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new ApiError(
          `Failed to fetch data from user service: ${response.statusText}`
        );
      }
      logger.info(`Data student: ${response.data.Datastuden.email}`);
      return { DataStuent: response.data.Datastuden }; // Ensure you return an object with DataStuent
    } catch (error: unknown) {
      throw error;
    }
  }
  async GetStudentById(userId: string): Promise<{ DataStuent: StudentType }> {
    const url = `${config.studentService}${PATH_SERVICE.STUDENT.GETLOUTIN}/${userId}`;
    logger.info(
      `Attempting to create user at URL: ${url} has ${config.studentService}`
    );
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new ApiError(
          `Failed to fetch data from user service: ${response.statusText}`
        );
      }
      return { DataStuent: response.data.Datastuden }; // Ensure you return an object with DataStuent
    } catch (error: unknown) {
      throw error;
    }
  }

  async FindEmailByStudent(authId: string, email: string) {
    try {
    } catch (error: unknown) {
      throw error;
    }
  }
  // Correct destructuring
}
