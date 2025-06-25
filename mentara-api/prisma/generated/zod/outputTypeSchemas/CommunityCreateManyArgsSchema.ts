import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityCreateManyInputSchema } from '../inputTypeSchemas/CommunityCreateManyInputSchema'

export const CommunityCreateManyArgsSchema: z.ZodType<Prisma.CommunityCreateManyArgs> = z.object({
  data: z.union([ CommunityCreateManyInputSchema,CommunityCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CommunityCreateManyArgsSchema;
