import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { AdminCreateManyInputSchema } from '../inputTypeSchemas/AdminCreateManyInputSchema'

export const AdminCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AdminCreateManyAndReturnArgs> = z.object({
  data: z.union([ AdminCreateManyInputSchema,AdminCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default AdminCreateManyAndReturnArgsSchema;
