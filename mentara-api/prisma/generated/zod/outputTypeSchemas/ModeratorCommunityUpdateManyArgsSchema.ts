import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCommunityUpdateManyMutationInputSchema } from '../inputTypeSchemas/ModeratorCommunityUpdateManyMutationInputSchema'
import { ModeratorCommunityUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ModeratorCommunityUncheckedUpdateManyInputSchema'
import { ModeratorCommunityWhereInputSchema } from '../inputTypeSchemas/ModeratorCommunityWhereInputSchema'

export const ModeratorCommunityUpdateManyArgsSchema: z.ZodType<Prisma.ModeratorCommunityUpdateManyArgs> = z.object({
  data: z.union([ ModeratorCommunityUpdateManyMutationInputSchema,ModeratorCommunityUncheckedUpdateManyInputSchema ]),
  where: ModeratorCommunityWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ModeratorCommunityUpdateManyArgsSchema;
