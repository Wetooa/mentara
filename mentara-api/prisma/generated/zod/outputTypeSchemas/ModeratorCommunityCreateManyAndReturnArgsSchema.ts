import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityCreateManyInputSchema } from '../inputTypeSchemas/ModeratorCommunityCreateManyInputSchema'

export const ModeratorCommunityCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ModeratorCommunityCreateManyAndReturnArgs> = z.object({
  data: z.union([ ModeratorCommunityCreateManyInputSchema,ModeratorCommunityCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ModeratorCommunityCreateManyAndReturnArgsSchema;
