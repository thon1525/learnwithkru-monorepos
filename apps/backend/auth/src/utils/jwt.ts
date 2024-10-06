const salt = 10;
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { getConfig } from './createConfig';
import { ApiError } from '@auth/errors/ApiError';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { StatusCode } from './StatusCode';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from './logger';
import crypto from 'crypto';
const privateKeyPath = path.join(__dirname, '../../private_key.pem');
// Read the private key from the file
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const encryptionKey = crypto.randomBytes(32); // 256-bit key for encryption
const iv = crypto.randomBytes(16); // Initialization vector
const IV_LENGTH = 16;
const currentEnv = process.env.NODE_ENV || 'development';
const config = getConfig(currentEnv);

export const generatePassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new ApiError('Unable to generate password');
  }
};

export const generateSignature = async ({
  _id,
  role,
}: {
  _id: string;
  role: string;
}): Promise<string> => {
  const payloadData = {
    id: _id,
    role: role,
  };
  try {
    return await jwt.sign({ payload: payloadData }, privateKey, {
      expiresIn: config.jwtExpiresIn!,
      algorithm: 'RS256',
    });
  } catch (error: unknown) {
    throw new BaseCustomError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      StatusCode.NotAcceptable
    );
  }
};

export const validatePassword = async ({
  enteredPassword,
  savedPassword,
}: {
  enteredPassword: string;
  savedPassword: string;
}) => {
  try {
    const isPasswordCorrect = await bcrypt.compare(
      enteredPassword,
      savedPassword
    );
    return isPasswordCorrect;
  } catch (error) {
    throw error;
  }
};

export const decodedToken = (token: string) => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;

    if (!decoded || typeof decoded !== 'object' || !('payload' in decoded)) {
      throw new Error('Invalid token structure');
    }

    return decoded.payload;
  } catch (error) {
    logger.error('Unable to decode in decodeToken() method!', { token, error });
    throw new ApiError("Can't decode token!");
  }
};

export const generateSignatureForgetpassword = async ({
  _id,
  role,
}: {
  _id: string;
  role: string;
}): Promise<string> => {
  const payloadData = {
    id: _id,
    role: role,
  };
  try {
    return await jwt.sign({ payload: payloadData }, privateKey, {
      expiresIn: '1m',
      algorithm: 'RS256',
    });
  } catch (error: unknown) {
    throw new BaseCustomError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      StatusCode.NotAcceptable
    );
  }
};

// Function to encrypt the JWT token
export function encryptToken(token: string): string {
  // Generate a new IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV and encrypted token concatenated by ':'
  return `${iv.toString('hex')}:${encrypted}`;
}

// Function to decrypt the JWT token
export function decryptToken(encrypted: string): string {
  try {
    const [ivHex, encryptedToken] = encrypted.split(':');
    if (!ivHex || !encryptedToken) {
      throw new Error(
        'Invalid token format. Expected format is IV:EncryptedToken.'
      );
    }

    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      encryptionKey,
      ivBuffer
    );

    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw error; // Re-throw error after logging
  }
}
