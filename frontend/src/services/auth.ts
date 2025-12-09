import api from './api';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'patient']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authApi = {
  register: (data: z.infer<typeof registerSchema>) => api.post('/auth/register', data),
  login: (data: z.infer<typeof loginSchema>) => api.post('/auth/login', data),
};
