"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MapPin, Calendar, Shield, Star, Flag } from "lucide-react";
import { PublicProfileResponse } from "@/lib/api/services/profile";
import { format, parseISO } from "date-fns";
import { ChatButton } from "./ChatButton";
import { ConnectTherapistButton } from "./ConnectTherapistButton";
import { getUserDisplayName, getUserInitials } from "@/lib/utils/userUtils";
import { ROUTES } from "@/lib/navigation/routes";

interface ProfileHeaderProps {
  profile: PublicProfileResponse;
  isOwnProfile: boolean;
  onEditClick: () => void;
  onReportClick: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEditClick,
  onReportClick,
}: ProfileHeaderProps) {
  const { user, therapist } = profile;

  // Get user's full name and initials
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  // Format join date
  const joinDate = format(parseISO(user.createdAt), "MMMM yyyy");

  // Get role-specific badge color and icon
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "therapist":
        return { variant: "default" as const, icon: Shield, text: "Therapist" };
      case "admin":
        return { variant: "destructive" as const, icon: Shield, text: "Admin" };
      case "moderator":
        return {
          variant: "secondary" as const,
          icon: Shield,
          text: "Moderator",
        };
      default:
        return { variant: "outline" as const, icon: null, text: "Client" };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-100">
        {user.coverImageUrl && (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {!user.coverImageUrl && (
          <div className="absolute inset-0 bg-gray-100" />
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
              <h1 className="text-2xl font-bold text-gray-900">
                {displayName}
              </h1>
              <Badge
                variant={roleBadge.variant}
                className="flex items-center gap-1 w-fit"
              >
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
              {user.role === "therapist" && therapist && (
                <>
                  {therapist.yearsOfExperience && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>
                        {therapist.yearsOfExperience} years experience
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons - Better positioned below profile info */}
            <div className="mt-4 flex flex-wrap gap-2">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditClick}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  {/* Chat Button - Always available for non-own profiles */}
                  <ChatButton
                    targetUserId={user.id}
                    targetUserName={displayName}
                    variant="default"
                    size="sm"
                  />

                  {/* Connect with Therapist Button - Only for therapist profiles */}
                  {user.role === "therapist" && (
                    <ConnectTherapistButton
                      therapistId={user.id}
                      connectionStatus={profile.connectionStatus || null}
                      therapistName={displayName}
                      variant="outline"
                      size="sm"
                    />
                  )}

                  {/* Book Session - Only for therapist profiles */}
                  {user.role === "therapist" && (
                    <Link
                      href={`${ROUTES.CLIENT.BOOKING}?therapist=${encodeURIComponent(user.id)}`}
                    >
                      <Button variant="default" size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Book Session
                      </Button>
                    </Link>
                  )}

                  {/* Report button - Always available for other profiles */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReportClick}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4 sm:ml-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile.stats.communitiesCount}
              </div>
              <div className="text-xs text-gray-500">Communities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile.stats.postsCount}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile.stats.commentsCount}
              </div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProfileHeader;
