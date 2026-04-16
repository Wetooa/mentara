import { z } from 'zod';
import { UserRole } from '../../types/enums';

export const SearchTherapistsQueryDtoSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  experienceYears: z.number().int().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
  gender: z.enum(['male', 'female', 'non-binary']).optional(),
  languages: z.array(z.string()).optional(),
  availability: z.enum(['immediate', 'within_week', 'within_month']).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
});

export const SearchPostsQueryDtoSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  communityId: z.string().optional(),
});

export const SearchCommunitiesQueryDtoSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

export const SearchUsersQueryDtoSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  role: z.nativeEnum(UserRole).optional(),
});

export const GlobalSearchQueryDtoSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  types: z.array(z.enum(['users', 'therapists', 'posts', 'communities', 'worksheets', 'messages'])).optional(),
});