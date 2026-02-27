import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export function validateSchema(schema: z.ZodSchema<any>, data: any) {
  const result = schema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: !result.success ? (result as any).error.errors : [],
  };
}

export function formatValidationErrors(errors: any[]) {
  return errors
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}
