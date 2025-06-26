import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingNotesWhereInputSchema } from '../inputTypeSchemas/MeetingNotesWhereInputSchema'

export const MeetingNotesDeleteManyArgsSchema: z.ZodType<Prisma.MeetingNotesDeleteManyArgs> = z.object({
  where: MeetingNotesWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingNotesDeleteManyArgsSchema;
