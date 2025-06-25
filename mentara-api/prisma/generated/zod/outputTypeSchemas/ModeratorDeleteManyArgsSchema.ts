import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorWhereInputSchema } from '../inputTypeSchemas/ModeratorWhereInputSchema'

export const ModeratorDeleteManyArgsSchema: z.ZodType<Prisma.ModeratorDeleteManyArgs> = z.object({
  where: ModeratorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ModeratorDeleteManyArgsSchema;
