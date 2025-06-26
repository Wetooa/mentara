import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityCreateManyInputSchema } from '../inputTypeSchemas/ModeratorCommunityCreateManyInputSchema'

export const ModeratorCommunityCreateManyArgsSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyArgs> = z.object({
  data: z.union([ ModeratorCommunityCreateManyInputSchema,ModeratorCommunityCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ModeratorCommunityCreateManyArgsSchema;
