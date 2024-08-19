import { ObjectId, Types } from 'mongoose';
import { AccountVerificationRepository } from '../database/repositories/account.verification.repository';
import { AuthRepository } from '../database/repositories/auth.respository';
import { getConfig } from '../utils/createConfig';
import { GenerateTimeExpire } from '../utils/generateTimeExpire';
import AccountVerificationModel from '../database/models/account-verification.model';
import { ApiError } from '../errors/ApiError';
import { logger } from '../utils/logger';
import { generateEmailVerificationToken } from '../utils/accountVerification';
import { publishDirectMessage } from '../queue/publishDirectMessage';
import { authChannel } from '../server';

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
      logger.debug(email);
      // Step 4: Prepare email message details based on type
      let messageDetails;
      if (type === 'verifyEmail') {
        messageDetails = {
          receiverEmail: email,
          verifyLink: `${config.clientUrl}/verify-email?token=${newAccountVerification.emailVerificationToken}`,
          template: 'verifyEmail',
        };
      } else if (type === 'verifyResetPassword') {
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
      throw new ApiError('Unable to send email to user!');
    }
  }
}
