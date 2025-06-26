import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityWhereInputSchema } from '../inputTypeSchemas/CommunityWhereInputSchema'

export const CommunityDeleteManyArgsSchema: z.ZodType<Prisma.CommunityDeleteManyArgs> = z.object({
  where: CommunityWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CommunityDeleteManyArgsSchema;
