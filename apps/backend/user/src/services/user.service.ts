import { UpdateType, UserTypes } from '@user/@types/UserTyps';
import { UserModel } from '@user/database/models/user.model';
import { UserRepository } from '@user/database/repositories/user.repository';
import { ApiError } from '@user/errors/ApiError';
import { BaseCustomError } from '@user/errors/BaseCustomError';
import { logger } from '@user/utils/logger';
import { StatusCode } from '@user/utils/StatusCode';

export class UserServices {
  public UserRepo: UserRepository;
  constructor() {
    this.UserRepo = new UserRepository();
  }
  async CreateUser({
    authId,
    firstname,
    lastname,
    email,
    picture,
    role,
  }: UserTypes): Promise<UserTypes> {
    try {
      // TODO
      // 1. encrypt token
      // 2. make requst to get auth user in auth service database
      // 3. create new user in database
      const existingUser = await this.UserRepo.FindAuthUser(authId as string);

      if (existingUser) {
        throw new BaseCustomError(
          'User is exist in database!',
          StatusCode.BadRequest
        );
      }
      // step 3
      const newUser = await this.UserRepo.SaveUser({
        authId,
        firstname,
        lastname,
        email,
        picture,
        role,
      });
      return newUser;
    } catch (error: unknown) {
      throw error;
    }
  }
  async GetUserByAuthId(authId: string) {
    try {
      const user = await this.UserRepo.FindAuthUser(authId);

      if (!user) {
        throw new ApiError('Unable to find user in database!');
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(
        'An unexpected error occurred while retrieving the user in GetUserByAuthId() method!',
        error
      );
      throw new ApiError(
        'An unexpected error occurred while retreive the user.'
      );
    }
  }
  // bu authId
  async FindAuthUser(authId: string) {
    try {
      const User = await UserModel.findOne({
        authId: authId,
      });
      return User;
    } catch (error: unknown) {
      throw error;
    }
  }

  async GetUserByUserId(userId: string): Promise<UserTypes> {
    try {
      const user = (await this.UserRepo.FindUser(userId)) as UserTypes;

      if (!user) {
        throw new ApiError('Unable to find user in database!');
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(
        'An unexpected error occurred while retrieving the user in GetUserByUserId() method!',
        error
      );
      throw new ApiError(
        'An unexpected error occurred while retrieving the user.'
      );
    }
  }

  async UpdateUserByUserId(
    authId: string,
    Data: UpdateType
  ): Promise<{ DataUser: UserTypes }> {
    try {
      const UpdateUser = await this.UserRepo.UpdateUser(authId, Data);
      return { DataUser: UpdateUser };
    } catch (error: unknown) {
      throw error;
    }
  }

  async RemoveUserById(userId: string): Promise<{ data: any }> {
    try {
      const result = await this.UserRepo.findAndDeleteUserById(userId);
      if (!result) {
        throw new BaseCustomError('User not found', StatusCode.NotFound);
      }
      return {
        data: result,
      };
    } catch (error: unknown) {
      throw error;
    }
  }
}
