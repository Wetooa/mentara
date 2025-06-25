import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { MeetingDurationWhereInputSchema } from '../inputTypeSchemas/MeetingDurationWhereInputSchema'

export const MeetingDurationDeleteManyArgsSchema: z.ZodType<Prisma.MeetingDurationDeleteManyArgs> = z.object({
  where: MeetingDurationWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default MeetingDurationDeleteManyArgsSchema;
