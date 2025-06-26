import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesUpdateManyMutationInputSchema } from '../inputTypeSchemas/MeetingNotesUpdateManyMutationInputSchema'
import { MeetingNotesUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/MeetingNotesUncheckedUpdateManyInputSchema'
import { MeetingNotesWhereInputSchema } from '../inputTypeSchemas/MeetingNotesWhereInputSchema'

export const MeetingNotesUpdateManyArgsSchema: z.ZodType<Prisma.MeetingNotesUpdateManyArgs> = z.object({
  data: z.union([ MeetingNotesUpdateManyMutationInputSchema,MeetingNotesUncheckedUpdateManyInputSchema ]),
  where: MeetingNotesWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingNotesUpdateManyArgsSchema;
