import { UserTypes } from '@auth/@types/AuthSignup';
import { getConfig } from './createConfig';
import { PATH_SERVICE } from '@auth/routes/pathDdefs';
import { logger } from './logger';
import { ApiError } from '@auth/errors/ApiError';
import axios from 'axios';

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
export class RequestUserService {
  async CreateUser({
    authId,
    firstname,
    lastname,
    email,
    picture,
    role,
  }: UserTypes) {
    const url = `${config.userService}${PATH_SERVICE.USER.CREATE_USER}`;
    logger.info(`Attempting to create user at URL: ${url}`);
    try {
      const res = await axios.post(
        url,
        {
          authId,
          firstname,
          lastname,
          email,
          picture,
          role,
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

      return res.data;
    } catch (error: unknown) {
      throw error;
    }
  }
  async GetUser(authId: string) {
    const url = `${config.userService}${PATH_SERVICE.USER.GET_USER}/${authId}`;
    logger.info(`Attempting to create user at URL: ${url}`);
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch data from user service: ${response.statusText}`
        );
      }
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }
  async UpdateUser({
    authId,
    firstname,
    lastname,
    email,
    picture,
  }: UserTypes): Promise<{ message: string; DataUser: UserTypes }> {
    const url = `${config.userService}${PATH_SERVICE.USER.UPDATE_USER}/${authId}`;
    logger.info(`Attempting to create user at URL: ${url}`);
    logger.info(
      `data users ${authId},${firstname},${lastname},${email},${picture}`
    );
    try {
      const response = await axios.patch(
        url,
        { firstname, lastname, email, picture, authId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000, // Set an appropriate timeout
        }
      );

      if (!response.data) {
        logger.error('User service did not return data.');
        throw new ApiError('User service did not return data.');
      }

      logger.info(
        `User updated successfully: ${JSON.stringify(response.data)}`
      );
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  async GetUserById(id: string) {
    const url = `${config.userService}${PATH_SERVICE.USER.GET_USER_BYID}/${id}`;
    logger.info(
      `Attempting to create user at URL: ${url}   has ${config.userService}`
    );
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new ApiError(
          `Failed to fetch data from user service: ${response.statusText}`
        );
      }
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  async RemoveUserById(userId: string) {
    const url = `${config.userService}${PATH_SERVICE.USER.REMOVE_BYID}/${userId}`;
    logger.info(
      `Attempting to create user at URL: ${url}   has ${config.userService}`
    );
    try {
      const response = await axios.delete(url);
      if (response.status !== 200) {
        throw new ApiError(
          `Failed to fetch data from user service: ${response.statusText}`
        );
      }
      return response.data;
    } catch (error: unknown) {
      throw error;
    }
  }
}
