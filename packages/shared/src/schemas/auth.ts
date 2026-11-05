import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(10),
  prenom: z.string().min(1),
  nom: z.string().min(1),
  telephone: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(10),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
