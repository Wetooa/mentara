import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockUpdateManyMutationInputSchema } from '../inputTypeSchemas/UserBlockUpdateManyMutationInputSchema'
import { UserBlockUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/UserBlockUncheckedUpdateManyInputSchema'
import { UserBlockWhereInputSchema } from '../inputTypeSchemas/UserBlockWhereInputSchema'

export const UserBlockUpdateManyArgsSchema: z.ZodType<Prisma.UserBlockUpdateManyArgs> = z.object({
  data: z.union([ UserBlockUpdateManyMutationInputSchema,UserBlockUncheckedUpdateManyInputSchema ]),
  where: UserBlockWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default UserBlockUpdateManyArgsSchema;
