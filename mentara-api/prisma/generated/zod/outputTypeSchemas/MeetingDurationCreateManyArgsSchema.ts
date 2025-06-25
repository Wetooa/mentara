import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationCreateManyInputSchema } from '../inputTypeSchemas/MeetingDurationCreateManyInputSchema'

export const MeetingDurationCreateManyArgsSchema: z.ZodType<Prisma.MeetingDurationCreateManyArgs> = z.object({
  data: z.union([ MeetingDurationCreateManyInputSchema,MeetingDurationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MeetingDurationCreateManyArgsSchema;
