"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { PublicProfileResponse } from '@/lib/api/services/profile';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  EyeOff,
  FileText,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

interface ProfileActivityProps {
  recentActivity: PublicProfileResponse['recentActivity'];
  stats: PublicProfileResponse['stats'];
}

export function ProfileActivity({ recentActivity, stats }: ProfileActivityProps) {
  const { userRole } = useAuth();
  const hasActivity = recentActivity.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Activity Stats */}
        <div className="flex gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.postsCount}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.commentsCount}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              Comments
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        {hasActivity ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} userRole={userRole} />
            ))}

            {recentActivity.length >= 20 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing recent activity only
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600 mb-4">
              This user hasn't posted or commented recently.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  activity,
  userRole
}: {
  activity: PublicProfileResponse['recentActivity'][0];
  userRole: UserRole | null;
}) {
  const formattedDate = format(parseISO(activity.createdAt), 'MMM d, yyyy');
  const isPost = activity.type === 'post';

  return (
    <div className="border-l-2 border-l-gray-200 pl-4 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Activity Type and Community */}
          <div className="flex items-center gap-2 mb-2">
            {isPost ? (
              <FileText className="w-4 h-4 text-blue-600" />
            ) : (
              <MessageCircle className="w-4 h-4 text-green-600" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {isPost ? 'Posted in' : 'Commented in'}
            </span>
            <Link
              href={`/${userRole}/community/${activity.community.slug}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {activity.community.name}
            </Link>
          </div>

          {/* Content */}
          <div className="mb-2">
            {/* Post Title */}
            {isPost && activity.title && (
              <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {activity.title}
              </h4>
            )}

            {/* Content with Privacy Indicator */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className={`text-sm text-gray-600 line-clamp-3 ${!activity.isFromSharedCommunity ? 'italic' : ''
                  }`}>
                  {activity.content}
                </p>
              </div>

              {/* Privacy Indicator */}
              {!activity.isFromSharedCommunity && (
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Different Community
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Privacy Explanation */}
      {!activity.isFromSharedCommunity && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <div className="flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            <span>
              You can only see limited content from communities you're not part of
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileActivity;
