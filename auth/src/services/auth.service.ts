import {
  AuthSignup,
  AuthSignupWithPicture,
  DecodedUser,
  LoginTypes,
  UserPersional,
  UsersRepTypes,
  UserTypes,
} from '@auth/@types/AuthSignup';
import {
  generatePassword,
  generateSignature,
  validatePassword,
} from '@auth/utils/jwt';
import { AuthRepository } from '@auth/database/repositories/auth.respository';
import { StatusCode } from '@auth/utils/StatusCode';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { AccountVerificationRepository } from '@auth/database/repositories/account.verification.repository';
import { SendVerifyEmailService } from './Send.verif.email.service';
import { ApiError } from '@auth/errors/ApiError';
import { logger } from '@auth/utils/logger';
import { RequestUserService } from '@auth/utils/HttpRequest';
import { Oauth } from '@auth/utils/Oauth';
import { Types } from 'mongoose';
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
  async Signup(auth: AuthSignup): Promise<void> {
    const { email, lastname, firstname, password, role } = auth;

    try {
      // Step 1: Hash the password
      const hashedPassword = await generatePassword(password as string);

      // Step 2: Check if the user already exists
      const existingUser = await this.AuthRepo.FindUserByEmail({
        email: email as string,
      });

      if (existingUser) {
        if (existingUser.is_verified) {
          logger.info(
            `Your account is already signed up. Please log in instead.`
          );
          throw new BaseCustomError(
            'Your account is already signed up. Please log in instead.',
            StatusCode.BadRequest
          );
        }
      }
      // Step 3: Create a new user
      const newUser = await this.AuthRepo.CreateAuthUser({
        firstname,
        lastname,
        email,
        role: 'USER',
        password: hashedPassword,
      });
      // Step 4: Send a verification email for the newly created user
      await this.SendVerifyEmailService.SendVerifyEmailToken(
        {
          authId: newUser._id,
          email: newUser.email as string,
        },
        'verifyEmail'
      );
    } catch (error: unknown) {
      // Handle specific errors
      if (error instanceof BaseCustomError) {
        throw error;
      } else if (error instanceof ApiError) {
        logger.info(
          `A problem occurred during signup. Please try again later.`
        );
        throw new BaseCustomError(
          'A problem occurred during signup. Please try again later.',
          StatusCode.InternalServerError
        );
      }

      // Handle unexpected errors
      throw new BaseCustomError(
        'An unexpected error occurred. Please try again later.',
        StatusCode.InternalServerError
      );
    }
  }

  async Login(
    user: LoginTypes
  ): Promise<{ token: string; DataUsers: UserPersional }> {
    // TODO:
    // 1. Find user by email
    // 2. Validate the password
    // 3. check validate users {user ,student, tutor}
    // 4. Generate Token & Return data all users
    try {
      const { email, password } = user;
      // step 1
      const existingUser = await this.AuthRepo.FindUserByEmail({ email });

      if (!existingUser) {
        throw new BaseCustomError('User not exist', StatusCode.NotFound);
      }
      // step 2
      if (existingUser.is_verified === false) {
        throw new BaseCustomError(
          "your email isn't verify",
          StatusCode.BadRequest
        );
      }
      // step 3
      const isPwdCorrect = await validatePassword({
        enteredPassword: password as string,
        savedPassword: existingUser.password as string,
      });
      if (!isPwdCorrect) {
        throw new BaseCustomError(
          'Email or Password is incorrect',
          StatusCode.BadRequest
        );
      }

      // Step 4: Role-based handling and return `DataUser` if applicable
      let DataUsers: UserPersional | undefined;
      switch (existingUser.role) {
        case 'USER':
          // Handle USER role-specific logic
          const requestUser = new RequestUserService();
          logger.info(`DATA: ID ${existingUser.id}`);
          const { DataUser } = await requestUser.GetUser(existingUser.id);
          DataUsers = {
            firstname: DataUser.firstname,
            lastname: DataUser.lastname,
            email: DataUser.email,
            picture: DataUser.picture,
            role: DataUser.role,
            _id: DataUser._id,
          };
          break;
        case 'STUDENT':
          // Handle STUDENT role-specific logic
          break;
        case 'TUTOR':
          // Handle TUTOR role-specific logic
          break;
        default:
          throw new BaseCustomError('Invalid user role', StatusCode.BadRequest);
      }
      if (!DataUsers) {
        throw new BaseCustomError(
          'User data could not be retrieved',
          StatusCode.InternalServerError
        );
      }
      // Step 5: Generate JWT token
      logger.info(`data role has : ${DataUsers.role}`);
      const jwtToken = await generateSignature({
        _id: DataUsers._id as string,
        role: DataUsers.role as string,
      });

      return { token: jwtToken, DataUsers };
    } catch (error: unknown) {
      throw error instanceof BaseCustomError
        ? error
        : new BaseCustomError(
            'Internal Server Error',
            StatusCode.InternalServerError
          );
    }
  }

  async Logout(decodedUser: DecodedUser): Promise<boolean> {
    try {
      let DataUsers: UserPersional | undefined;
      const { id, role } = decodedUser;
      logger.info(`data role user: ${role}`);
      switch (role) {
        case 'USER':
          // Handle USER role-specific logic
          const requestUser = new RequestUserService();
          logger.info(`DATA: ID ${id}`);
          const { DataUser } = await requestUser.GetUserById(id);
          DataUsers = DataUser;
          break;
        case 'STUDENT':
          // Handle STUDENT role-specific logic
          break;
        case 'TUTOR':
          // Handle TUTOR role-specific logic
          break;
        default:
          throw new BaseCustomError('Invalid user role', StatusCode.BadRequest);
      }
      if (!DataUsers) {
        throw new ApiError('No user found!', StatusCode.NotFound);
      }
      return true;
    } catch (error: unknown) {
      throw error;
    }
  }
  async SigninWithGoogleCallBack(code: string) {
    try {
      const googleConfig = await Oauth.getInstance();

      const tokenResponse = await googleConfig.GoogleStrategy(code);
      const accessToken = tokenResponse!.access_token;
      const userInfoResponse = await googleConfig.GoogleAccessInfo(accessToken);

      const { given_name, family_name, email, id, verified_email, picture } =
        userInfoResponse.data;
      logger.info('finding email');
      const user = await this.AuthRepo.FindUserByEmail({ email });
      logger.info('hello user already servers');
      console.log(typeof user);
      if (user) {
        logger.info('hello user has email');
        if (!user.googleId) {
          logger.info('hello not id google');
          const NewUser = await this.AuthRepo.FindUserByIdAndUpdate({
            id: user._id,
            updates: {
              googleId: id,
              is_verified: true,
              picture,
            },
          });
          const Data: UserTypes = {
            authId: NewUser!._id.toString(),
            firstname: NewUser!.firstname as string,
            lastname: NewUser!.lastname as string,
            email: NewUser!.email as string,
            picture: NewUser!.picture as string,
          };
          const requestUser = new RequestUserService();
          const { DataUser } = await requestUser.UpdateUser(Data);
          const jwtToken = await generateSignature({
            _id: DataUser._id?.toString() as string,
            role: DataUser.role as string,
          });
          return { DataUser, token: jwtToken };
        }

        const requestUser = new RequestUserService();
        const { DataUser } = await requestUser.GetUser(user._id.toString());
        const jwtToken = await generateSignature({
          _id: DataUser._id.toString(),
          role: DataUser.role as string,
        });
        return { DataUser, token: jwtToken };
      }

      const newUser = await this.AuthRepo.CreateOauthUser({
        firstname: given_name,
        lastname: family_name,
        email,
        googleId: id,
        is_verified: verified_email,
        picture,
        role: 'USER',
      });
      // create user
      const Data: UserTypes = {
        authId: newUser!._id.toString(),
        firstname: newUser!.firstname as string,
        lastname: newUser!.lastname as string,
        email: newUser!.email as string,
        role: newUser!.role,
        picture: newUser!.picture as string,
      };
      const requestUser = new RequestUserService();

      const { DataUser } = await requestUser.CreateUser(Data);
      if (!DataUser) {
        throw new ApiError("Can't create new user in user service!");
      }
      const jwtToken = await generateSignature({
        _id: DataUser._id.toString(),
        role: DataUser.role as string,
      });
      return { DataUser, token: jwtToken };
    } catch (error: unknown) {
      throw error;
    }
  }
  async RequestResetPassword({ email }: { email: string }) {
    try {
      // Find existing user by email
      const existingUser = await this.AuthRepo.FindUserByEmail({ email });

      // Check if the user exists
      if (!existingUser) {
        throw new BaseCustomError('User not found!', StatusCode.NotFound);
      }

      // Check if the email is verified
      if (!existingUser.is_verified) {
        throw new BaseCustomError(
          "Your email isn't verified. Please verify your email!",
          StatusCode.Unauthorized
        );
      }

      // Step 5: Generate JWT token

      // Check if the user has a password (i.e., not signed up via a third-party app)
      // if (!existingUser.password) {
      //   throw new BaseCustomError(
      //     'Your account is signed up with a third-party app',
      //     StatusCode.BadRequest
      //   );
      // }

      // Send verification email token
      await this.SendVerifyEmailService.SendVerifyEmailToken(
        {
          authId: existingUser._id,
          email: existingUser.email as string,
        },
        'verifyResetPassword'
      );
    } catch (error) {
      logger.error('This error accurs in ResetPassword method! :', error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new ApiError('Somthing went wrong!');
    }
  }
  async ConfirmResetPassword(
    { password }: { password: string },
    token: string
  ) {
    //**************** */
    // 1. check old passwrod that exist
    // 2 hash new password
    // 3 create new user to database
    try {
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
      const id: string | Types.ObjectId = verificationToken.authId;
      const existingUser = await this.AuthRepo.FindAuthById({ id });

      if (!existingUser) {
        throw new BaseCustomError('User not found!', StatusCode.NotFound);
      }
      // 2. Check if the entered password matches the current one
      const isPwdCorrect = await validatePassword({
        enteredPassword: password,
        savedPassword: existingUser.password as string,
      });

      if (isPwdCorrect) {
        throw new BaseCustomError(
          'Password is the same as the current password.',
          StatusCode.BadRequest
        );
      }

      const hashedPassword = await generatePassword(password);
      existingUser.password = hashedPassword;

      await existingUser.save();
      await this.accountVerificationRepo.DeleteVerificationByToken({ token });

      return;
    } catch (error: unknown) {
      logger.error('This error accurs in ConfirmResetPassword method!', error);
      if (error instanceof BaseCustomError) {
        throw error;
      }
      throw new ApiError('Somthing went  wrong!');
    }
  }

  async IdentifyUser({
    id,
    role,
  }: {
    id: string;
    role: string;
  }): Promise<{ DataUsers: UserPersional; token: string }> {
    try {
      // step 1
      // Step 4: Role-based handling and return `DataUser` if applicable
      let DataUsers: UserPersional | undefined;
      switch (role) {
        case 'USER':
          // Handle USER role-specific logic
          const requestUser = new RequestUserService();
          const { DataUser } = await requestUser.GetUserById(id);
          DataUsers = {
            firstname: DataUser.firstname,
            lastname: DataUser.lastname,
            email: DataUser.email,
            picture: DataUser.picture,
            role: DataUser.role,
            _id: DataUser._id,
          };
          break;
        case 'STUDENT':
          // Handle STUDENT role-specific logic
          break;
        case 'TUTOR':
          // Handle TUTOR role-specific logic
          break;
        default:
          throw new BaseCustomError('Invalid user role', StatusCode.BadRequest);
      }
      if (!DataUsers) {
        throw new BaseCustomError(
          'User data could not be retrieved',
          StatusCode.InternalServerError
        );
      }
      // Step 6: Generate JWT token
      logger.info(`data all user has data ${DataUsers._id}`);
      const jwtToken = await generateSignature({
        _id: DataUsers._id as string,
        role: DataUsers.role as string,
      });

      return { DataUsers, token: jwtToken };
    } catch (error: unknown) {
      throw error;
    }
  }
}
