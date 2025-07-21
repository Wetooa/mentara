'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Heart,
  CheckCircle,
  Info,
  Star,
  TrendingUp
} from 'lucide-react';
import { CommunityRecommendation } from '@/lib/api/services/communities';

interface CommunityRecommendationCardProps {
  community: CommunityRecommendation;
  rank: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  disabled?: boolean;
  showMatchExplanation?: boolean;
}

export function CommunityRecommendationCard({
  community,
  rank,
  isSelected,
  onSelect,
  disabled = false,
  showMatchExplanation = true,
}: CommunityRecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Possible Match';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
    } ${disabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                disabled={disabled}
                className="mt-1"
              />
              <Badge variant="outline" className="text-xs">
                #{rank}
              </Badge>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{community.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getScoreColor(community.compatibilityScore)}`}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {Math.round(community.compatibilityScore * 100)}% Match
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm mb-2">
                {community.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{community.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{getScoreLabel(community.compatibilityScore)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {showMatchExplanation && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Why this community?
                </p>
                <p className="text-sm text-muted-foreground">
                  {community.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="border-t pt-3 mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Community Type:</span>
                <p className="text-muted-foreground">Support Group</p>
              </div>
              <div>
                <span className="font-medium">Activity Level:</span>
                <p className="text-muted-foreground">
                  {community.memberCount > 100 ? 'Very Active' : 
                   community.memberCount > 50 ? 'Active' : 'Growing'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                Join a supportive community of people who understand your experience
              </span>
            </div>
          </div>
        )}

        {isSelected && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-2">
            <CheckCircle className="h-4 w-4" />
            <span>Selected for joining</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}