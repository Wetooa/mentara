"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, MapPin, Calendar, Shield, Star } from 'lucide-react';
import { PublicProfileResponse } from '@/lib/api/services/profile';
import { format, parseISO } from 'date-fns';
import { ChatButton } from './ChatButton';

interface ProfileHeaderProps {
  profile: PublicProfileResponse;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

export function ProfileHeader({ profile, isOwnProfile, onEditClick }: ProfileHeaderProps) {
  const { user, therapist } = profile;
  
  // Get user's full name
  const displayName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(' ') || 'Anonymous User';
  
  // Get user initials for avatar fallback
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map(name => name.charAt(0).toUpperCase())
    .join('');

  // Format join date
  const joinDate = format(parseISO(user.createdAt), 'MMMM yyyy');

  // Get role-specific badge color and icon
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'therapist':
        return { variant: 'default' as const, icon: Shield, text: 'Therapist' };
      case 'admin':
        return { variant: 'destructive' as const, icon: Shield, text: 'Admin' };
      case 'moderator':
        return { variant: 'secondary' as const, icon: Shield, text: 'Moderator' };
      default:
        return { variant: 'outline' as const, icon: null, text: 'Client' };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {user.coverImageUrl && (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {!user.coverImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-purple-600/80" />
        )}
        
        {/* Edit Button (Own Profile Only) */}
        {isOwnProfile && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            onClick={onEditClick}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}

        {/* Chat Button (Other Profiles Only) */}
        {!isOwnProfile && (
          <ChatButton
            targetUserId={user.id}
            targetUserName={displayName}
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative -mt-16 sm:-mt-12">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={displayName} />
              <AvatarFallback className="text-lg font-semibold bg-gray-100">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name and Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <Badge variant={roleBadge.variant} className="flex items-center gap-1 w-fit">
                {roleBadge.icon && <roleBadge.icon className="w-3 h-3" />}
                {roleBadge.text}
              </Badge>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-600 mb-3 max-w-2xl">{user.bio}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinDate}</span>
              </div>
              
              {/* Therapist-specific info */}
              {user.role === 'therapist' && therapist && (
                <>
                  {therapist.yearsOfExperience && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{therapist.yearsOfExperience} years experience</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4 sm:ml-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profile.stats.communitiesCount}</div>
              <div className="text-xs text-gray-500">Communities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profile.stats.postsCount}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{profile.stats.commentsCount}</div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProfileHeader;