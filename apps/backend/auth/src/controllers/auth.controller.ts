import {
  Body,
  Controller,
  Get,
  Header,
  Middlewares,
  Post,
  Query,
  Route,
  Request,
  SuccessResponse,
} from 'tsoa';
import { StatusCode } from '@auth/utils/StatusCode';
import { PATH_AUTH, PATH_SERVICE } from '../routes/pathDdefs';
import { zodValidate } from '@auth/middlewares/zodValidate';
import { authLoginSchema, AuthSchema } from '@auth/schemas/AuthSchema';
import {
  AuthSignup,
  AuthSignupWithPicture,
  DecodedUser,
  LoginTypes,
  Student,
  StudentType,
  UserPersional,
  UsersRepTypes,
} from '../@types/AuthSignup';
import { AuthServices } from '@auth/services/auth.service';
import { SendVerifyEmailService } from '@auth/services/Send.verif.email.service';
import { logger } from '@auth/utils/logger';
import { getConfig } from '@auth/utils/createConfig';
import { Oauth } from '@auth/utils/Oauth';
import { ApiError } from '@auth/errors/ApiError';
import { decodedToken, decryptToken } from '@auth/utils/jwt';
import { authorize } from '@auth/middlewares/authorize';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { StudentServices } from '@auth/services/student.service';
import { ResponseData } from '@auth/utils/ResponseData';

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
@Route('/v1/auth')
export class AuthController extends Controller {
  @Post(PATH_AUTH.signUp)
  @SuccessResponse(StatusCode.Created, 'Created')
  @Middlewares(zodValidate(AuthSchema))
  async Signup(@Body() requestBody: AuthSignup): Promise<{ message: string }> {
    // Corrected method name
    const { firstname, lastname, email, password } = requestBody;
    try {
      const authService = new AuthServices();
      await authService.Signup({
        firstname,
        lastname,
        email,
        password,
        role: 'USER',
      });

      return { message: 'please verify your Email!' };
    } catch (error) {
      throw error;
    }
  }

  @Get(PATH_AUTH.verify)
  @SuccessResponse(StatusCode.OK, 'Success')
  async VerifySignupEmail(@Query() token: string): Promise<{
    message: string;
    Data: AuthSignupWithPicture;
    token: string;
  }> {
    try {
      const verifyService = new SendVerifyEmailService();
      const user = await verifyService.VerifyEmailToken(token);

      const { firstname, lastname, email, picture } = user.DataUsers;
      logger.info('dataUsers', firstname, lastname, email, picture);
      return {
        message: 'Success verified',
        Data: { firstname, lastname, email, picture },
        token: user.token,
      };
    } catch (error: unknown) {
      throw error;
    }
  }
  @SuccessResponse(StatusCode.OK, 'OK')
  @Get(PATH_AUTH.verifyResetPassword)
  async VerifyResetPasswordEmail(
    @Query() token: string
  ): Promise<{ message: string }> {
    try {
      const verifyService = new SendVerifyEmailService();
      const user = await verifyService.VerifyResetPasswordToken(token);

      return user;
    } catch (error: unknown) {
      logger.error(
        'This error accurs in VerifyResetPasswordToken method! ',
        error
      );
      throw error;
    }
  }

  @Post(PATH_AUTH.login)
  @SuccessResponse(StatusCode.OK, 'OK')
  @Middlewares(zodValidate(authLoginSchema))
  async LoginWithEmail(
    @Body() requestBody: LoginTypes
  ): Promise<{ message: string; Data: UserPersional; token: string }> {
    try {
      const authService = new AuthServices();
      const userAll = await authService.Login(requestBody);
      const ResponseObject = new ResponseData();
      const DataResponse = ResponseObject.prepareResponse(userAll.DataUsers);

      return {
        message: 'Success login',
        Data: DataResponse,
        token: userAll.token,
      };
    } catch (error: unknown) {
      throw error;
    }
  }
  @SuccessResponse(StatusCode.Found, 'FOUND')
  @Get(PATH_AUTH.googleOAuth)
  async GoogleOAuth() {
    const redirectUri = config.googleRedirectUrl!;
    const clientId = config.googleClientId!;
    try {
      const googleConfig = await Oauth.getInstance();
      const authUrl = await googleConfig.GoogleConfigUrl(clientId, redirectUri);
      return { redirectUrl: authUrl };
    } catch (error: unknown) {
      throw error;
    }
  }
  @SuccessResponse(StatusCode.OK, 'OK')
  @Get(PATH_AUTH.googleOAuthCallBack)
  async GoogleOAuthData(@Query() code: string): Promise<{
    message: string;
    Data: AuthSignupWithPicture;
    token: string;
  }> {
    try {
      const authService = new AuthServices();
      const user = await authService.SigninWithGoogleCallBack(code);
      const { firstname, lastname, email, picture } = user.DataUser;
      return {
        message: 'Success signup',
        Data: { firstname, lastname, email, picture },
        token: user.token,
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  @SuccessResponse(StatusCode.OK, 'OK')
  @Get(PATH_AUTH.logout)
  async Logout(
    @Header('authorization') authorization: string
  ): Promise<{ message: string; isLogout: true }> {
    try {
      const token = authorization?.split(' ')[1];
      logger.info(`data token ${token}`);
      const decodedUser: DecodedUser = await decodedToken(token);
      logger.info(`data user has ${decodedUser.id}`);
      const service = new AuthServices();
      const isLogout = await service.Logout(decodedUser);

      if (!isLogout) {
        throw new ApiError('Unable to logout!');
      }
      logger.info(`user true or false: ${isLogout}`);
      return { message: 'Success logout', isLogout: isLogout };
    } catch (error: unknown) {
      throw error;
    }
  }

  @SuccessResponse(StatusCode.OK, 'OK')
  @Post(PATH_AUTH.requestResetPassword)
  async RequestResetPassword(
    @Body() requestBody: { email: string }
  ): Promise<{ message: string }> {
    const { email } = requestBody;
    try {
      const service = new AuthServices();
      await service.RequestResetPassword({ email });
      return { message: 'Success verified' };
    } catch (error: unknown) {
      throw error;
    }
  }

  @SuccessResponse(StatusCode.OK, 'OK')
  @Post(PATH_AUTH.ResetPassword)
  async ConfirmPassword(
    @Body() requestBody: { password: string },
    @Query() token: string
  ): Promise<{ message: string }> {
    try {
      const { password } = requestBody;
      if (!token) {
        throw new Error('Token is missing');
      }

      const service = new AuthServices();
      await service.ConfirmResetPassword({ password }, token);
      return { message: 'Success reset password' };
    } catch (error: unknown) {
      throw error;
    }
  }
  @SuccessResponse(StatusCode.OK, 'OK')
  @Get(PATH_AUTH.USER_IDENTIFY)
  @Middlewares(authorize(['USER', 'STUDENT', 'TUTOR']))
  async IdentifyAuth(
    @Request() req: Express.Request
  ): Promise<{ message: string; Data: UserPersional; token: string }> {
    try {
      const userId = (req.user as DecodedUser).id as string; // Type assertion here
      const RoleUser = (req.user as DecodedUser).role as string;
      logger.info(`data login role data  :${userId}`);
      // identify auth ={user ,student,tutor}userId
      if (!userId) {
        throw new BaseCustomError('User ID is required', StatusCode.Found);
      }

      const service = new AuthServices();
      const user = await service.IdentifyUser({ id: userId, role: RoleUser });
      if (!user) {
        throw new ApiError('UsersData not fourd is missing');
      }
      logger.info(`datas is user has ${user.DataUsers}`);
      const { firstname, lastname, email, picture } =
        user.DataUsers as UserPersional;
      return {
        message: 'user already',
        Data: { firstname, lastname, email, picture },
        token: user.token,
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  @SuccessResponse(StatusCode.Created, 'Created')
  @Post(PATH_SERVICE.STUDENT.SIGNUPSTUDENT)
  @Middlewares(authorize(['USER', 'STUDENT', 'TUTOR']))
  async BecomeToStudent(
    @Request() req: Express.Request,
    @Body() requestBody: Student
  ): Promise<{ message: string; Data: StudentType; token: string }> {
    try {
      const userId = (req.user as DecodedUser).id as string; // Type assertion here
      const RoleUser = (req.user as DecodedUser).role as string;
      logger.info(`Student has ${RoleUser}`);
      if (!userId) {
        throw new BaseCustomError('User ID is required', StatusCode.Found);
      }

      const studentData = new StudentServices();
      const DataStudent = await studentData.CreateStudent(
        requestBody,
        RoleUser,
        userId
      );
      const {
        lastname,
        firstname,
        email,
        picture,
        grade,
        schoolName,
        studentCard,
        education,
      } = DataStudent.DataStuent;
      return {
        message: 'student all ready',
        Data: {
          lastname,
          firstname,
          email,
          picture,
          grade,
          schoolName,
          studentCard,
          education,
        },
        token: DataStudent.token,
      };
    } catch (error: unknown) {
      throw error;
    }
  }
}
