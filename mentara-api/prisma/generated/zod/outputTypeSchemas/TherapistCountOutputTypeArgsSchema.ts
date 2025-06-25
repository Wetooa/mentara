import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { TherapistCountOutputTypeSelectSchema } from './TherapistCountOutputTypeSelectSchema';

export const TherapistCountOutputTypeArgsSchema: z.ZodType<Prisma.TherapistCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TherapistCountOutputTypeSelectSchema).nullish(),
}).strict();

export default TherapistCountOutputTypeSelectSchema;
