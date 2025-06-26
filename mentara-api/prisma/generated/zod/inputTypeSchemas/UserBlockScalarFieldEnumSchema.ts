import { z } from 'zod';

export const UserBlockScalarFieldEnumSchema = z.enum(['id','blockerId','blockedId','reason','createdAt']);

export default UserBlockScalarFieldEnumSchema;
