export interface AuthSignup {
  firstname: string;
  lastname: string;
  email: string;
  role?: 'USER' | 'STUDENT' | 'TUTOR';
  password?: string;
  googleId?: string;
  is_verified?: boolean;
}

export type AuthSignupWithPicture = Partial<AuthSignup> & {
  _id?: string;
  picture?: string | null;
};

export type UserTypes = Partial<AuthSignupWithPicture> & {
  _id?: string;
  authId?: string;
};

export type UsersRepTypes = Partial<AuthSignup> & {
  _id: string;
  authId?: string;
  picture?: string | null;
};

export type LoginTypes = Pick<AuthSignup, 'email' | 'password'>;

export type GoogleType = Pick<
  AuthSignupWithPicture,
  'googleId' | 'is_verified' | 'picture'
>;

export type UserPersional = Pick<
  AuthSignupWithPicture,
  'firstname' | 'lastname' | 'picture' | 'email' | '_id' | 'role'
>;
export interface DecodedUser {
  id: string;
  role: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser; // Make sure 'user' is optional in case it's not always set
    }
  }
}

export type StudentType = Partial<UserTypes> & {
  authId?: string;
  schoolName: string;
  education: string;
  grade: number;
  studentCard: string;
};
