import {
  CommunityCreateInputSchema,
  CommunitySchema,
  CommunityUpdateInputSchema,
  MembershipSchema,
  RoomGroupSchema,
  RoomSchema,
} from 'prisma/generated/zod';
import { z } from 'zod';

export type CreateCommunityDto = z.infer<typeof CommunityCreateInputSchema>;

export type UpdateCommunityDto = z.infer<typeof CommunityUpdateInputSchema>;

export type MembershipResponse = z.infer<typeof MembershipSchema>;

export type RoomResponse = z.infer<typeof RoomSchema>;

export type RoomGroupResponse = z.infer<typeof RoomGroupSchema>;

export type CommunityResponse = z.infer<typeof CommunitySchema>;

export type CommunityWithStructureResponse = z.infer<
  typeof CommunitySchema & {
    roomGroups: z.infer<
      typeof RoomGroupSchema & { rooms: z.infer<typeof RoomSchema>[] }
    >[];
  }
>;

export type CommunityWithMembersResponse = z.infer<
  typeof CommunitySchema & {
    members: z.infer<typeof MembershipSchema>[];
  }
>;

export const CommunityStatsResponse = z.object({
  totalMembers: z.number(),
  totalPosts: z.number(),
  activeCommunities: z.number(),
  illnessCommunities: z.array(
    z.object({
      illness: z.string(),
      communityCount: z.number(),
      memberCount: z.number(),
    }),
  ),
});
export type CommunityStatsResponse = z.infer<typeof CommunityStatsResponse>;
