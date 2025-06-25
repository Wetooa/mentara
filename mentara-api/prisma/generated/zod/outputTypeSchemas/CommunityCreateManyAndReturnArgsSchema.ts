import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityCreateManyInputSchema } from '../inputTypeSchemas/CommunityCreateManyInputSchema'

export const CommunityCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CommunityCreateManyAndReturnArgs> = z.object({
  data: z.union([ CommunityCreateManyInputSchema,CommunityCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CommunityCreateManyAndReturnArgsSchema;
