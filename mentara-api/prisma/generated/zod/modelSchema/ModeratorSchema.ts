import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// MODERATOR SCHEMA
/////////////////////////////////////////

export const ModeratorSchema = z.object({
  userId: z.string(),
  permissions: z.string().array(),
  assignedCommunities: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Moderator = z.infer<typeof ModeratorSchema>

export default ModeratorSchema;
