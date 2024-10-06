import { UserServices } from '@user/services/user.service';
import { UpdateType, UserTypes } from '../@types/UserTyps';
import { StatusCode } from '@user/utils/StatusCode';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Route,
  SuccessResponse,
} from 'tsoa';
import { PATH_USER } from '../routes/PathDefs';
import { logger } from '@user/utils/logger';
import { ApiError } from '@user/errors/ApiError';
import { BaseCustomError } from '@user/errors/BaseCustomError';
@Route('/v1/users')
export class UserController extends Controller {
  @SuccessResponse(StatusCode.Created, 'Created')
  @Post('/create')
  async Createuser(
    @Body() requestBody: UserTypes
  ): Promise<{ message: string; DataUser: UserTypes }> {
    const { authId, firstname, lastname, email, picture, role } = requestBody;
    try {
      const service = new UserServices();
      const NewUser = await service.CreateUser({
        authId,
        firstname,
        lastname,
        email,
        picture,
        role,
      });

      return { message: 'Success Created', DataUser: NewUser };
    } catch (error: unknown) {
      throw error;
    }
  }

  @SuccessResponse(StatusCode.OK, 'OK')
  @Get(PATH_USER.GET_USER_BY_AUTH_ID)
  async GetUserByAuthId(
    @Path() authId: string
  ): Promise<{ message: string; DataUser: UserTypes }> {
    try {
      const service = new UserServices();
      const user = await service.GetUserByAuthId(authId);

      return { message: 'Success retrieve user', DataUser: user };
    } catch (error: unknown) {
      throw error;
    }
  }
  @SuccessResponse(StatusCode.OK, 'OK')
  @Get(PATH_USER.GET_USER_BY_USER_ID)
  async GetUserByUserId(
    @Path() userId: string
  ): Promise<{ message: string; DataUser: UserTypes }> {
    try {
      const service = new UserServices();
      const user = (await service.GetUserByUserId(userId)) as UserTypes;
      // logger.info(`data user has role: ${user.role}`);
      return { message: 'Success retrieve user', DataUser: user };
    } catch (error: unknown) {
      throw error;
    }
  }
  @SuccessResponse(StatusCode.OK, 'OK')
  @Patch(PATH_USER.UPDATE_USER)
  async UpdateUserByUserId(
    @Path() authId: string,
    @Body() requestBody: UpdateType
  ): Promise<{ message: string; DataUser: UserTypes }> {
    try {
      const service = new UserServices();
      const { DataUser } = await service.UpdateUserByUserId(
        authId,
        requestBody
      );
      if (!DataUser) {
        throw new ApiError('Failed to update user.');
      }

      logger.info(`User data in service: ${JSON.stringify(DataUser)}`);
      return { message: 'Success update', DataUser };
    } catch (error: unknown) {
      logger.error(`Error updating user: ${error}`);
      throw error;
    }
  }

  @SuccessResponse(StatusCode.OK, 'OK')
  @Delete(PATH_USER.DELETE_BY_USERID)
  async DataUserByUserId(
    @Path() userId: string
  ): Promise<{ message: string; dataUser: any }> {
    try {
      const service = new UserServices();
      const userData = await service.RemoveUserById(userId);
      if (!userData) {
        throw new BaseCustomError('User not found', StatusCode.NotFound);
      }
      return {
        message: 'User deleted successfully',
        dataUser: userData,
      };
    } catch (error: unknown) {
      throw error;
    }
  }
}
