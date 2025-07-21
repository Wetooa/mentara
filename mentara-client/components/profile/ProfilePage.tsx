"use client";

import { useState } from 'react';
import { useProfile } from '@/hooks/profile/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  FileText, 
  Star,
  Shield,
  Briefcase,
  Clock,
  DollarSign,
  Globe
} from 'lucide-react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileCommunities } from './ProfileCommunities';
import { ProfileActivity } from './ProfileActivity';
import { ProfileInfo } from './ProfileInfo';
import { ProfileEditModal } from './ProfileEditModal';
import { cn } from '@/lib/utils';

interface ProfilePageProps {
  userId: string;
  className?: string;
}

export function ProfilePage({ userId, className }: ProfilePageProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading, error } = useProfile(userId);

  // Determine if current user is viewing their own profile
  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <ProfilePageSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600">This profile may not exist or you may not have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info & Communities */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileInfo profile={profile} />
            <ProfileCommunities 
              mutualCommunities={profile.mutualCommunities}
              stats={profile.stats}
            />
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-2">
            <ProfileActivity 
              recentActivity={profile.recentActivity}
              stats={profile.stats}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
}

function ProfilePageSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <Card className="p-6">
        <div className="relative">
          {/* Cover Image Skeleton */}
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
          
          {/* Profile Info Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar Skeleton */}
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            
            {/* Name and Bio Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-md" />
            </div>
          </div>
        </div>
      </Card>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;