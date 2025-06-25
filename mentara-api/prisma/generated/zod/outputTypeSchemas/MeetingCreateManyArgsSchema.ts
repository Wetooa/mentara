import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingCreateManyInputSchema } from '../inputTypeSchemas/MeetingCreateManyInputSchema'

export const MeetingCreateManyArgsSchema: z.ZodType<Prisma.MeetingCreateManyArgs> = z.object({
  data: z.union([ MeetingCreateManyInputSchema,MeetingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MeetingCreateManyArgsSchema;
