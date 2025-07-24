import { AxiosInstance } from "axios";
import { profile } from "console";

export interface PublicProfileResponse {
  user: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    role: string;
    createdAt: string;
  };
  therapist?: {
    specializations?: string[];
    yearsOfExperience?: number;
    sessionLength?: string;
    hourlyRate?: number;
    areasOfExpertise?: string[];
    languages?: string[];
  };
  connectionStatus?: 'connected' | 'pending' | null; // Connection status to this user/therapist
  mutualCommunities: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: "post" | "comment";
    title?: string; // for posts
    content: string;
    createdAt: string;
    community: {
      name: string;
      slug: string;
    };
    isFromSharedCommunity: boolean;
  }>;
  stats: {
    postsCount: number;
    commentsCount: number;
    communitiesCount: number;
    sharedCommunitiesCount: number;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  isActive?: boolean;
  role?: string;
}

export interface UpdateProfileResponse {
  user: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Profile API service for viewing and managing user profiles
 */
export function createProfileService(axios: AxiosInstance) {
  return {
    /**
     * Get public profile by user ID
     * Shows community-filtered content and mutual communities
     */
    async getProfile(userId: string): Promise<PublicProfileResponse> {
      const { data } = await axios.get(`/profile/${userId}`);
      return data;
    },

    /**
     * Update own profile
     * Only allows updating basic profile fields
     */
    async updateProfile(
      profileData: UpdateProfileRequest
    ): Promise<UpdateProfileResponse> {
      const { data } = await axios.put("/profile", profileData);
      return data;
    },

    /**
     * Upload profile avatar
     */
    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await axios.put("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { avatarUrl: data.user.avatarUrl };
    },

    /**
     * Upload profile cover image
     */
    async uploadCoverImage(file: File): Promise<{ coverImageUrl: string }> {
      const formData = new FormData();
      formData.append("cover", file);

      const { data } = await axios.put("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { coverImageUrl: data.user.coverImageUrl };
    },

    /**
     * Update profile with file uploads
     */
    async updateProfileWithFiles(
      profileData: UpdateProfileRequest,
      userId: string,
      files?: { avatar?: File; cover?: File }
    ): Promise<UpdateProfileResponse> {
      try {
        if (files && (files.avatar || files.cover)) {
          // Use FormData for file uploads
          const formData = new FormData();

          // Add profile data
          Object.entries(profileData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });

          // Add files
          if (files.avatar) {
            formData.append("avatar", files.avatar);
          }
          if (files.cover) {
            formData.append("cover", files.cover);
          }

          const { data } = await axios.put(`/users/${userId}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          return data;
        } else {
          // Use JSON for data-only updates
          const { data } = await axios.put(`/users/${userId}`, profileData, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          return data;
        }
      } catch (error) {
        console.error("Failed to update user profile:", error);
        throw error;
      }
    },
  };
}
