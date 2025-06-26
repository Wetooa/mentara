import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','email','firstName','middleName','lastName','birthDate','address','avatarUrl','role','createdAt','updatedAt','bio','coverImageUrl','isActive']);

export default UserScalarFieldEnumSchema;
