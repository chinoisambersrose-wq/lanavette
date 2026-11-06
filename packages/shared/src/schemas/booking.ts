import { z } from 'zod';

export const createBookingSchema = z.object({
  sessionId: z.string().min(1),
});

export type CreateBookingInput = z.input<typeof createBookingSchema>;

export const rescheduleBookingSchema = z.object({
  newSessionId: z.string().min(1),
});

export type RescheduleBookingInput = z.input<typeof rescheduleBookingSchema>;

export const cancelBookingSchema = z.object({
  motif: z.string().optional(),
});

export type CancelBookingInput = z.input<typeof cancelBookingSchema>;

export const forceBookingExceptionSchema = z.object({
  motif: z.string().min(1),
});

export type ForceBookingExceptionInput = z.input<typeof forceBookingExceptionSchema>;
