import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CommunityUpdateManyMutationInputSchema } from '../inputTypeSchemas/CommunityUpdateManyMutationInputSchema'
import { CommunityUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CommunityUncheckedUpdateManyInputSchema'
import { CommunityWhereInputSchema } from '../inputTypeSchemas/CommunityWhereInputSchema'

export const CommunityUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CommunityUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CommunityUpdateManyMutationInputSchema,CommunityUncheckedUpdateManyInputSchema ]),
  where: CommunityWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CommunityUpdateManyAndReturnArgsSchema;
