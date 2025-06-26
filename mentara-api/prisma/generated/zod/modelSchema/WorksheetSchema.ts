import { z } from 'zod';

/////////////////////////////////////////
// WORKSHEET SCHEMA
/////////////////////////////////////////

export const WorksheetSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string(),
  therapistId: z.string().nullable(),
  title: z.string(),
  instructions: z.string().nullable(),
  description: z.string().nullable(),
  dueDate: z.coerce.date(),
  status: z.string(),
  isCompleted: z.boolean(),
  submittedAt: z.coerce.date().nullable(),
  feedback: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Worksheet = z.infer<typeof WorksheetSchema>

export default WorksheetSchema;
