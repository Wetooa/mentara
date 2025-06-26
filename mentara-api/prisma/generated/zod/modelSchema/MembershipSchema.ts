import { z } from 'zod';

/////////////////////////////////////////
// MEMBERSHIP SCHEMA
/////////////////////////////////////////

export const MembershipSchema = z.object({
  id: z.string().uuid(),
  communityId: z.string(),
  role: z.string(),
  joinedAt: z.coerce.date(),
  userId: z.string().nullable(),
})

export type Membership = z.infer<typeof MembershipSchema>

export default MembershipSchema;
