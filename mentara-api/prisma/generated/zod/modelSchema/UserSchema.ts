import { z } from 'zod';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  birthDate: z.coerce.date().nullable(),
  address: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  bio: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  isActive: z.boolean(),
})

export type User = z.infer<typeof UserSchema>

export default UserSchema;
