import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ModeratorCreateManyInputSchema } from '../inputTypeSchemas/ModeratorCreateManyInputSchema'

export const ModeratorCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ModeratorCreateManyAndReturnArgs> = z.object({
  data: z.union([ ModeratorCreateManyInputSchema,ModeratorCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ModeratorCreateManyAndReturnArgsSchema;
