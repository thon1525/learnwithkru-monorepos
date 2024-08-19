import { authModel } from '../models/auth.model';
import { logger } from '../../utils/logger';
import { ApiError } from '../../errors/ApiError';
import { AuthSignup } from '../../@types/AuthSignup';
import { BaseCustomError } from '../../errors/BaseCustomError';
import { StatusCode } from '../../utils/StatusCode';
export class AuthRepository {
  async CreateAuthUser(dataUser: AuthSignup) {
    try {
      const { email, password, lastname, firstname } = dataUser;
      const existingUser = await this.FindUserByEmail({
        email: email as string,
      });
      if (existingUser) {
        throw new BaseCustomError('Email already exists', StatusCode.Forbidden);
      }

      const user = await authModel.create({
        firstname,
        lastname,
        email,
        password,
      });
      if (!user) {
        throw new ApiError('Unable to create use in database!');
      }

      return await user.save();
    } catch (error: unknown) {
      throw error;
    }
  }

  async FindUserByEmail({ email }: { email: string }) {
    try {
      const existingUser = await authModel.findOne({ email: email });
      return existingUser;
    } catch (error) {
      logger.error('Unexpected an accurs error: ', error);
      throw new ApiError('Somthing went wrong!');
    }
  }
}
