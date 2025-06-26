import { z } from 'zod';

/////////////////////////////////////////
// ADMIN SCHEMA
/////////////////////////////////////////

export const AdminSchema = z.object({
  userId: z.string(),
  permissions: z.string().array(),
  adminLevel: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Admin = z.infer<typeof AdminSchema>

export default AdminSchema;
