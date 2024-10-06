import { ApiError } from '@auth/errors/ApiError';
import { getConfig } from './createConfig';
import axios from 'axios';
import { logger } from './logger';
import { AccessInfo, RequestBody, TokenResponse } from './@types/Oauth.type';

const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);
export class Oauth {
  private static instance: Oauth;

  private constructor() {
    // Any initialization logic you want to perform
  }
  public static async getInstance(): Promise<Oauth> {
    if (!Oauth.instance) {
      Oauth.instance = new Oauth();
    }
    return Oauth.instance;
  }

  async getToken(
    requestBody: RequestBody,
    url: string
  ): Promise<TokenResponse> {
    try {
      logger.info(`RequestBody: ${requestBody} and url : ${url}`);
      const { data } = await axios.post<TokenResponse>(url, requestBody);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async GoogleConfigUrl(clienId: string, redirectUri: string) {
    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clienId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=email%20profile`;

      return authUrl;
    } catch (error: unknown) {
      throw new ApiError('Unable to AuthConfigUrl in Google API');
    }
  }
  async GoogleStrategy(code: string): Promise<TokenResponse> {
    const requestBody = {
      code,
      client_id: config.googleClientId!,
      client_secret: config.googleClientSecret!,
      redirect_uri: config.googleRedirectUrl!,
      grant_type: 'authorization_code',
    };
    const url = 'https://oauth2.googleapis.com/token';
    try {
      return await this.getToken(requestBody, url);
    } catch (error) {
      throw error;
    }
  }
  async AccessInfo({ access_token, url }: AccessInfo) {
    try {
      const userInfoResponse = await axios.get(url, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return userInfoResponse;
    } catch (error: unknown) {
      throw new ApiError(error as string);
    }
  }
  async GoogleAccessInfo(access_token: string) {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
    try {
      return await this.AccessInfo({ access_token, url });
    } catch (error: unknown) {
      throw error;
    }
  }
}
