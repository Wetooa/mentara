import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesCreateManyInputSchema } from '../inputTypeSchemas/MeetingNotesCreateManyInputSchema'

export const MeetingNotesCreateManyAndReturnArgsSchema: z.ZodType<Prisma.MeetingNotesCreateManyAndReturnArgs> = z.object({
  data: z.union([ MeetingNotesCreateManyInputSchema,MeetingNotesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default MeetingNotesCreateManyAndReturnArgsSchema;
