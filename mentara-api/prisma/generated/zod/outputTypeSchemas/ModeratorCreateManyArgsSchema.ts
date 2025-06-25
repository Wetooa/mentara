import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCreateManyInputSchema } from '../inputTypeSchemas/ModeratorCreateManyInputSchema'

export const ModeratorCreateManyArgsSchema: z.ZodType<Prisma.ModeratorCreateManyArgs> = z.object({
  data: z.union([ ModeratorCreateManyInputSchema,ModeratorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ModeratorCreateManyArgsSchema;
