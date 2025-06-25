import { z } from 'zod';

export const ClientScalarFieldEnumSchema = z.enum(['userId','hasSeenTherapistRecommendations','createdAt','updatedAt']);

export default ClientScalarFieldEnumSchema;
