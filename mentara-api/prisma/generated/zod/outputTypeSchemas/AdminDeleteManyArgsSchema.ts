import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminWhereInputSchema } from '../inputTypeSchemas/AdminWhereInputSchema'

export const AdminDeleteManyArgsSchema: z.ZodType<Prisma.AdminDeleteManyArgs> = z.object({
  where: AdminWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default AdminDeleteManyArgsSchema;
