import { z } from 'zod';
import { emailLogs, sendEmailSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  email: {
    send: {
      method: 'POST' as const,
      path: '/api/email/send',
      input: sendEmailSchema,
      responses: {
        200: z.object({ message: z.string(), success: z.boolean() }),
        400: errorSchemas.validation,
        500: errorSchemas.internal
      }
    },
    history: {
      method: 'GET' as const,
      path: '/api/email/history',
      responses: {
        200: z.array(z.custom<typeof emailLogs.$inferSelect>())
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SendEmailInput = z.infer<typeof api.email.send.input>;
export type EmailHistoryResponse = z.infer<typeof api.email.history.responses[200]>;
