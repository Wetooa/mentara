import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityWhereInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereInputSchema'

export const ModeratorCommunityDeleteManyArgsSchema: z.ZodType<Prisma.ModeratorCommunityDeleteManyArgs> = z.object({
  where: ModeratorCommunityWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ModeratorCommunityDeleteManyArgsSchema;
