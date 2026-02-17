"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, ExternalLink } from 'lucide-react';
import { PublicProfileResponse } from '@/lib/api/services/profile';
import { useCommunityNavigation } from '@/store/community';
import Link from 'next/link';

interface ProfileCommunitiesProps {
  mutualCommunities: PublicProfileResponse['mutualCommunities'];
  stats: PublicProfileResponse['stats'];
}

export function ProfileCommunities({ mutualCommunities, stats }: ProfileCommunitiesProps) {
  const { userRole } = useAuth();
  const hasSharedCommunities = mutualCommunities.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Communities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">{stats.communitiesCount}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-blue-600">{stats.sharedCommunitiesCount}</div>
            <div className="text-xs text-gray-500">Mutual</div>
          </div>
        </div>

        {/* Mutual Communities */}
        {hasSharedCommunities ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              Mutual Communities
              <Badge variant="secondary" className="text-xs">
                {stats.sharedCommunitiesCount}
              </Badge>
            </h4>
            
            <div className="space-y-2">
              {mutualCommunities.map((community) => (
                <CommunityItem key={community.id} community={community} userRole={userRole} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No mutual communities</p>
            <p className="text-xs text-gray-400">
              Join some communities to connect!
            </p>
          </div>
        )}

        {/* Link to all communities */}
        {hasSharedCommunities && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            asChild
          >
            <Link href={`/${userRole}/community`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Explore All Communities
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CommunityItem({ 
  community,
  userRole 
}: { 
  community: PublicProfileResponse['mutualCommunities'][0];
  userRole: string | null;
}) {
  const router = useRouter();
  const { navigateToCommunity } = useCommunityNavigation();

  // Generate initials from community name
  const initials = community.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const handleCommunityClick = () => {
    // Use state-based navigation instead of direct URL
    navigateToCommunity(community.id, router, userRole || 'client');
  };

  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
      onClick={handleCommunityClick}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={community.imageUrl} alt={community.name} />
        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
          {community.name}
        </p>
      </div>
      
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
    </div>
  );
}

export default ProfileCommunities;