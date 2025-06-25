import { z } from 'zod';

export const CommunityScalarFieldEnumSchema = z.enum(['id','name','slug','description','imageUrl','createdAt','updatedAt']);

export default CommunityScalarFieldEnumSchema;
