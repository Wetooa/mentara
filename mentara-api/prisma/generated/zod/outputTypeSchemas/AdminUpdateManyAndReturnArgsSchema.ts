import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminUpdateManyMutationInputSchema } from '../inputTypeSchemas/AdminUpdateManyMutationInputSchema'
import { AdminUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/AdminUncheckedUpdateManyInputSchema'
import { AdminWhereInputSchema } from '../inputTypeSchemas/AdminWhereInputSchema'

export const AdminUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AdminUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AdminUpdateManyMutationInputSchema,AdminUncheckedUpdateManyInputSchema ]),
  where: AdminWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default AdminUpdateManyAndReturnArgsSchema;
