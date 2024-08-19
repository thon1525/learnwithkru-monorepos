import {
  Body,
  Controller,
  Middlewares,
  Post,
  Route,
  SuccessResponse,
} from 'tsoa';
// import { getConfig } from "../utils/createConfig";
import { StatusCode } from '../utils/StatusCode';
import { PATH_AUTH } from '../routes/pathDdefs';
import { zodValidate } from '../middlewares/zodValidate';
import { AuthSchema } from '../schemas/AuthSchema';
import { AuthSignup } from '../@types/AuthSignup';
import { AuthServices } from '../services/auth.service';

// const currentEnv = process.env.NODE_ENV || "development";
// const config = getConfig(currentEnv);

@Route('/v1/auth')
export class AuthController extends Controller {
  @Post(PATH_AUTH.signUp)
  @SuccessResponse(StatusCode.Created, 'Created')
  @Middlewares(zodValidate(AuthSchema))
  async Singup(@Body() requestBody: AuthSignup): Promise<{ message: string }> {
    const { firstname, lastname, email, password } = requestBody;
    try {
      console.log(requestBody);
      const authService = new AuthServices();
      await authService.Signup({ firstname, lastname, email, password });

      return { message: 'please verify your Email!' };
    } catch (error) {
      throw error;
    }
  }
}
