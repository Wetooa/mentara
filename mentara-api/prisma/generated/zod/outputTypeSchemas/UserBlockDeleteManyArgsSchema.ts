import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockWhereInputSchema } from '../inputTypeSchemas/UserBlockWhereInputSchema'

export const UserBlockDeleteManyArgsSchema: z.ZodType<Prisma.UserBlockDeleteManyArgs> = z.object({
  where: UserBlockWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default UserBlockDeleteManyArgsSchema;
