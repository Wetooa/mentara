import { z } from 'zod';

export const AdminScalarFieldEnumSchema = z.enum(['userId','permissions','adminLevel','createdAt','updatedAt']);

export default AdminScalarFieldEnumSchema;
