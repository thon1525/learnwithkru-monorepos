import { UpdateType, UserTypes } from '@user/@types/UserTyps';
import { UserModel } from '../models/user.model';
import { logger } from '@user/utils/logger';
import { ApiError } from '@user/errors/ApiError';

export class UserRepository {
  async SaveUser({ authId, firstname, lastname, email, picture }: UserTypes) {
    try {
      // Create user instance
      const user = new UserModel({
        authId,
        firstname,
        lastname,
        email,
        picture,
        role: 'USER',
      });
      // Save user to database
      const newUser = await user.save();

      // Log success
      logger.info('User created successfully', { userId: newUser._id });

      return newUser;
    } catch (error: unknown) {
      // Rethrow error for further handling
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(
          'An unexpected error occurred while creating the user'
        );
      }
    }
  }

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
  //by User Id
  async FindUser(userId: string) {
    try {
      const user = await UserModel.findOne({
        _id: userId,
      });
      return user;
    } catch (error: unknown) {
      throw error;
    }
  }

  async UpdateUser(authId: string, userUpdate: UpdateType) {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { authId },
        { $set: userUpdate },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new ApiError('Unable to update user in database!');
      }

      return updatedUser;
    } catch (error: unknown) {
      throw new ApiError(`Failed to update user: ${error}`);
    }
  }

  async findAndDeleteUserById(userId: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(userId);
      return result !== null; // Return true if user was deleted, false otherwise
    } catch (error: unknown) {
      throw new ApiError(`Database error: ${(error as Error).message}`);
    }
  }
}
