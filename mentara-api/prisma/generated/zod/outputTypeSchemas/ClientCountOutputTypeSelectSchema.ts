import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const ClientCountOutputTypeSelectSchema: z.ZodType<Prisma.ClientCountOutputTypeSelect> = z.object({
  worksheets: z.boolean().optional(),
  worksheetSubmissions: z.boolean().optional(),
  clientMedicalHistory: z.boolean().optional(),
  clientPreferences: z.boolean().optional(),
  assignedTherapists: z.boolean().optional(),
  meetings: z.boolean().optional(),
  reviews: z.boolean().optional(),
}).strict();

export default ClientCountOutputTypeSelectSchema;
