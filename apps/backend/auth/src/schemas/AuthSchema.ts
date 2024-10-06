import { z } from 'zod';

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstname: z.string().min(1, 'firstname name is required'),
  lastname: z.string().min(1, 'lastname is required'),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
