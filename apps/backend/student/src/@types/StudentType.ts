interface StudentType {
  authId?: string;
  firstname: string;
  lastname: string;
  email: string;
  picture?: string;
  schoolName: string;
  education: string;
  grade: number;
  studentCard?: string;
  role?: 'USER' | 'STUDENT' | 'TUTOR';
}
