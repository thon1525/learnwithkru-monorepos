import { generate as generateRandomString } from 'randomstring';

export function generateEmailVerificationToken(): string {
  return generateRandomString({
    length: 32,
    charset: 'hex',
  });
}
