import { z } from 'zod';

export const ticketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']);
export const ticketPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTicketSchema = z.object({
  title: z.string().min(5).max(80),
  description: z.string().min(20).max(2000),
  priority: ticketPriorityEnum.default('MEDIUM'),
  status: ticketStatusEnum.optional(),
});

export const updateTicketSchema = z
  .object({
    title: z.string().min(5).max(80).optional(),
    description: z.string().min(20).max(2000).optional(),
    priority: ticketPriorityEnum.optional(),
    status: ticketStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const listTicketsQuerySchema = z.object({
  q: z.string().optional(),
  status: ticketStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  sort: z.enum(['createdAt_asc', 'createdAt_desc']).optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => !isNaN(v) && v > 0, { message: 'page must be a positive number' }),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .refine((v) => !isNaN(v) && v > 0 && v <= 100, {
      message: 'limit must be between 1 and 100',
    }),
});

export const paginateQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => !isNaN(v) && v > 0, { message: 'page must be a positive number' }),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .refine((v) => !isNaN(v) && v > 0 && v <= 100, {
      message: 'limit must be between 1 and 100',
    }),
});

export const createCommentSchema = z.object({
  authorName: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
});

