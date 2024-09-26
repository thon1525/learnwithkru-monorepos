export interface UserTypes {
  firstname: string;
  lastname: string;
  email: string;
  picture: string | null;
  authId: string;
  role?: 'USER' | 'STUDENT' | 'TUTOR';
  _id?: string;
}

export type UpdateType = Pick<
  UserTypes,
  'firstname' | 'lastname' | 'picture' | 'email' | 'authId'
>;
