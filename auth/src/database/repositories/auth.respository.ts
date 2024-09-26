import { authModel } from '../models/auth.model';
import { logger } from '@auth/utils/logger';
import { ApiError } from '@auth/errors/ApiError';
import {
  AuthSignup,
  AuthSignupWithPicture,
  GoogleType,
} from '@auth/@types/AuthSignup';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { StatusCode } from '@auth/utils/StatusCode';
import { Types } from 'mongoose';
export class AuthRepository {
  async CreateAuthUser(dataUser: AuthSignup) {
    try {
      const { email, password, lastname, firstname, role } = dataUser;
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
        role: role,
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

  async FindAuthById({ id }: { id: string | Types.ObjectId }) {
    try {
      // No need to wrap `id` in an object, just pass it directly

      const existingUser = await authModel.findById(id);

      return existingUser;
    } catch (error) {
      throw error;
    }
  }
  async FindUserByIdAndUpdate({
    id,
    updates,
  }: {
    id: string | Types.ObjectId;
    updates: GoogleType;
  }) {
    try {
      const existUser = await this.FindAuthById({ id });
      if (!existUser) {
        throw new ApiError("User does't exist!");
      }
      const updated = await authModel.findByIdAndUpdate(id, updates, {
        new: true,
      });
      return updated;
    } catch (error: unknown) {
      throw error;
    }
  }
  async CreateOauthUser({
    firstname,
    lastname,
    email,
    password,
    googleId,
    is_verified,
    picture,
    role,
  }: AuthSignupWithPicture) {
    try {
      const user = new authModel({
        firstname,
        lastname,
        email,
        password,
        googleId,
        is_verified,
        picture,
        role,
      });
      const userResult = await user.save();
      if (!user) {
        throw new ApiError('Unable to create user into Database!');
      }
      return userResult;
    } catch (error: unknown) {
      throw error;
    }
  }
}
