import { z } from 'zod';

/////////////////////////////////////////
// USER BLOCK SCHEMA
/////////////////////////////////////////

export const UserBlockSchema = z.object({
  id: z.string().uuid(),
  blockerId: z.string(),
  blockedId: z.string(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type UserBlock = z.infer<typeof UserBlockSchema>

export default UserBlockSchema;
