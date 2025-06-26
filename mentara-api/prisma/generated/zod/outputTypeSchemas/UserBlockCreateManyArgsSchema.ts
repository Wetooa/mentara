import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserBlockCreateManyInputSchema } from '../inputTypeSchemas/UserBlockCreateManyInputSchema'

export const UserBlockCreateManyArgsSchema: z.ZodType<Prisma.UserBlockCreateManyArgs> = z.object({
  data: z.union([ UserBlockCreateManyInputSchema,UserBlockCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default UserBlockCreateManyArgsSchema;
