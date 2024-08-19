import { AuthSignup } from '../@types/AuthSignup';
import { generatePassword } from '../utils/jwt';
import { AuthRepository } from '../database/repositories/auth.respository';
import { StatusCode } from '../utils/StatusCode';
import { BaseCustomError } from '../errors/BaseCustomError';
import { AccountVerificationRepository } from '../database/repositories/account.verification.repository';
import { SendVerifyEmailService } from './Send.verif.email.service';
export class AuthServices {
  private AuthRepo: AuthRepository;
  private accountVerificationRepo: AccountVerificationRepository;
  private SendVerifyEmailService: SendVerifyEmailService;

  constructor() {
    this.AuthRepo = new AuthRepository();
    this.accountVerificationRepo = new AccountVerificationRepository();
    this.SendVerifyEmailService = new SendVerifyEmailService();
  }

  // TODO LIST
  //************************* */
  // 1. hast password
  // 2. check existing user
  // 3. send verify email and handle for exist user
  // 4. create new user
  // 5. send verify email
  async Signup(auth: AuthSignup) {
    try {
      const { email, lastname, firstname, password } = auth;
      // stept 1
      const hashedPassword = await generatePassword(password as string);
      // step 2

      const existingUser = await this.AuthRepo.FindUserByEmail({
        email: email as string,
      });
      if (existingUser) {
        if (existingUser.is_verified === true) {
          throw new BaseCustomError(
            'Your account is already signed up. Please log in instead.',
            StatusCode.BadRequest
          );
        }
      }

      this.accountVerificationRepo.DeleteAccountVerifyByAuthId({
        authId: existingUser?.id,
      });

      this.SendVerifyEmailService.SendVerifyEmailToken(
        {
          authId: existingUser?.id,
          email: existingUser?.email as string,
        },
        'verifyEmail'
      );

      console.log('session');
      // step 3
      const newUser = await this.AuthRepo.CreateAuthUser({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });

      // step 4
      await this.SendVerifyEmailService.SendVerifyEmailToken(
        {
          authId: newUser._id,
          email: newUser.email as string,
        },
        'verifyEmail'
      );
    } catch (error: unknown) {
      throw error;
    }
  }
}
