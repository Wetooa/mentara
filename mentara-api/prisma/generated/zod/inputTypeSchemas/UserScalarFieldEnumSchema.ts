import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','email','firstName','middleName','lastName','birthDate','address','avatarUrl','role','isActive','createdAt','updatedAt']);

export default UserScalarFieldEnumSchema;
