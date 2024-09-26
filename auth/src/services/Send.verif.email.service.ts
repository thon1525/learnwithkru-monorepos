import { Types } from 'mongoose';
import { AccountVerificationRepository } from '@auth/database/repositories/account.verification.repository';
import { AuthRepository } from '@auth/database/repositories/auth.respository';
import { getConfig } from '@auth/utils/createConfig';
import { GenerateTimeExpire } from '@auth/utils/generateTimeExpire';
import AccountVerificationModel from '@auth/database/models/account-verification.model';
import { ApiError } from '@auth/errors/ApiError';
import { logger } from '@auth/utils/logger';
import { generateEmailVerificationToken } from '@auth/utils/accountVerification';
import { authChannel } from '@auth/server';
import { publishDirectMessage } from '@auth/queue/publishDirectMessage';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { StatusCode } from '@auth/utils/StatusCode';
import {
  AuthSignupWithPicture,
  UserPersional,
  UsersRepTypes,
} from '@auth/@types/AuthSignup';
import { encryptToken, generateSignature } from '@auth/utils/jwt';
import { RequestUserService } from '@auth/utils/HttpRequest';
import { string } from 'zod';
import { info } from 'winston';

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
export class SendVerifyEmailService {
  private accountVerificationRepo: AccountVerificationRepository;
  private authRepo: AuthRepository;

  constructor() {
    this.accountVerificationRepo = new AccountVerificationRepository();
    this.authRepo = new AuthRepository();
  }

  async SendVerifyEmailToken(
    {
      authId,
      email,
    }: {
      authId: Types.ObjectId;
      email: string;
    },
    type: 'verifyEmail' | 'verifyResetPassword'
  ) {
    try {
      // Step 1: Generate token
      const emailVerificationToken = generateEmailVerificationToken();
      const existingVerification = await AccountVerificationModel.findOne({
        authId,
      });

      if (existingVerification) {
        await this.accountVerificationRepo.DeleteAccountVerifyByAuthId({
          authId,
        });
        logger.info(`hello already delete `);
      }

      // Step 2: Generate current date and expiry date
      const now = new Date();
      const inTenMinutes = GenerateTimeExpire(now);
      // Step 3: Save verification data to the database
      const accountVerification = new AccountVerificationModel({
        authId,
        emailVerificationToken: emailVerificationToken,
        expiredAt: inTenMinutes,
      });
      const newAccountVerification = await accountVerification.save();
      let messageDetails;
      if (type === 'verifyEmail') {
        messageDetails = {
          receiverEmail: email,
          verifyLink: `${config.clientUrl}/verify-email?token=${newAccountVerification.emailVerificationToken}`,
          template: 'verifyEmail',
        };
      } else if (type === 'verifyResetPassword') {
        // Find existing user by email
        const existingUser = await this.authRepo.FindUserByEmail({ email });

        // Check if the user exists
        if (!existingUser) {
          throw new BaseCustomError('User not found!', StatusCode.NotFound);
        }
        const jwtToken = await generateSignature({
          _id: existingUser._id.toString() as string,
          role: existingUser.role as string,
        });

        // Encrypt the JWT token
        const encryptedToken = encryptToken(jwtToken);
        messageDetails = {
          receiverEmail: email,
          verifyLink: `${config.clientUrl}/verify-reset-password?token=${newAccountVerification.emailVerificationToken}`,
          template: 'verifyResetPassword',
        };
      }

      // Step 5: Send email by publishing a message to the notification service
      await publishDirectMessage(
        authChannel,
        'learnwithkru-verify-email',
        'auth-email',
        JSON.stringify(messageDetails),
        `Verify ${type} message has been sent to the notification service`
      );
    } catch (error) {
      logger.error(
        'Unexpected error occurs in SendVerifyEmailToken() method: ',
        error
      );
      //   throw new ApiError('Unable to send email to user!');
      throw error;
    }
  }

  async VerifyEmailToken(
    token: string
  ): Promise<{ token: string; DataUsers: UserPersional }> {
    try {
      // Step 1: Verify existing token
      logger.info('Token has recieved =', token);

      const verificationToken =
        await this.accountVerificationRepo.FindVerificationToken({ token });
      if (!verificationToken) {
        throw new BaseCustomError(
          'Verification token is invalid',
          StatusCode.BadRequest
        );
      }

      //   Step 2: Check expire date
      const now = new Date();
      if (now > verificationToken.expiredAt) {
        await this.accountVerificationRepo.DeleteVerificationByToken({ token });
        throw new BaseCustomError(
          'Verification token has expired',
          StatusCode.Unauthorized
        );
      }
      // Step 3: Find auth data in database
      const user = await this.authRepo.FindAuthById({
        id: verificationToken.authId,
      });

      if (!user) {
        throw new BaseCustomError('User does not exist', StatusCode.NotFound);
      }
      // Step 4: Check if user is already verified

      if (user.is_verified) {
        throw new BaseCustomError(
          'User is already verified',
          StatusCode.BadRequest
        );
      }
      const { _id, firstname, lastname, email } = user;
      // Step 5: Create user in database user service
      const Datas: AuthSignupWithPicture = {
        authId: _id.toString(),
        firstname: firstname!,
        lastname: lastname!,
        email: email!,
        picture: null,
      } as AuthSignupWithPicture;

      const requestUserService = new RequestUserService();
      const { DataUser } = await requestUserService.CreateUser(Datas);
      const DataUserRes = DataUser as UsersRepTypes;
      if (!DataUser) {
        throw new BaseCustomError(
          'Unable to create new user in user service',
          StatusCode.INTERNAL_SERVER_ERROR
        );
      }

      // Mark user as verified
      user.is_verified = true;
      await user.save();
      // Step 6: Generate JWT token
      const jwtToken = await generateSignature({
        _id: DataUserRes._id as string,
        role: DataUserRes.role as string,
      });
      const messageDetails = {
        receiver: DataUserRes._id.toString(),
        template: 'verifyResetPassword',
        timestamp: new Date().toLocaleString(),
        title: 'Congratulations on Joining Learnwithkru',
        message:
          'Thank you for joining us. We are excited to help you on your educational journey.',
      };

      await publishDirectMessage(
        authChannel,
        'learnwithkru-notification-message',
        'notification-message',
        JSON.stringify(messageDetails),
        `Success verify verify Email token message has been sent to the notification service`
      );
      // Step 8: Delete account verification token from database
      await this.accountVerificationRepo.DeleteVerificationByToken({ token });

      return { DataUsers: DataUserRes, token: jwtToken };
    } catch (error: unknown) {
      throw error;
    }
  }

  async VerifyResetPasswordToken(token: string): Promise<{ message: string }> {
    try {
      // Step 1: Verify existing token
      const verificationToken =
        await this.accountVerificationRepo.FindVerificationToken({ token });

      if (!verificationToken) {
        throw new BaseCustomError(
          'Verification token is invalid',
          StatusCode.BadRequest
        );
      }

      // Step 2: Check expire date
      // const now = new Date();
      // if (now > verificationToken.expiredAt) {
      //   await this.accountVerificationRepo.DeleteVerificationByToken({ token });
      //   throw new BaseCustomError(
      //     'Verification token has expired',
      //     StatusCode.Unauthorized
      //   );
      // }
      // Step 3: Find auth data in database
      const user = await this.authRepo.FindAuthById({
        id: verificationToken.authId,
      });

      if (!user) {
        throw new BaseCustomError('User does not exist', StatusCode.NotFound);
      }

      // Step 4: Check if user is already verified
      if (user.is_verified) {
        throw new BaseCustomError(
          'User is already verified',
          StatusCode.BadRequest
        );
      }
      return { message: 'Verify reset password successfully' };
    } catch (error: unknown) {
      throw error;
    }
  }
}
