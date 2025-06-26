import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorUpdateManyMutationInputSchema } from '../inputTypeSchemas/ModeratorUpdateManyMutationInputSchema'
import { ModeratorUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ModeratorUncheckedUpdateManyInputSchema'
import { ModeratorWhereInputSchema } from '../inputTypeSchemas/ModeratorWhereInputSchema'

export const ModeratorUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ModeratorUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ModeratorUpdateManyMutationInputSchema,ModeratorUncheckedUpdateManyInputSchema ]),
  where: ModeratorWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ModeratorUpdateManyAndReturnArgsSchema;
