'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Send, 
  Users, 
  CheckCircle, 
  Clock,
  Loader2,
  Star,
  X
} from 'lucide-react';

interface TherapistSelectionSummaryProps {
  selectedTherapists: string[];
  therapists: {
    id: string;
    matchScore?: number;
    hourlyRate?: number;
    user?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
    areasOfExpertise?: string[];
    [key: string]: unknown;
  }[];
  onSendRequests: () => Promise<void>;
  onSkipForNow: () => void;
  isLoading?: boolean;
}

export function TherapistSelectionSummary({
  selectedTherapists,
  therapists,
  onSendRequests,
  onSkipForNow,
  isLoading = false,
}: TherapistSelectionSummaryProps) {
  const selectedTherapistData = therapists.filter(t => 
    selectedTherapists.includes(t.id)
  );

  const averageMatchScore = selectedTherapistData.length > 0
    ? Math.round(
        selectedTherapistData.reduce((sum, t) => sum + (t.matchScore || 0), 0) / 
        selectedTherapistData.length
      )
    : 0;

  const totalHourlyRate = selectedTherapistData.reduce(
    (sum, t) => sum + (t.hourlyRate || 0), 
    0
  );
  const averageHourlyRate = selectedTherapistData.length > 0
    ? Math.round(totalHourlyRate / selectedTherapistData.length)
    : 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Your Selected Therapists
          <Badge variant="secondary" className="ml-auto">
            {selectedTherapists.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {averageMatchScore}%
            </div>
            <p className="text-sm text-muted-foreground">Average Match</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₱{averageHourlyRate}
            </div>
            <p className="text-sm text-muted-foreground">Average Rate/Hour</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {selectedTherapistData.reduce((sum, t) => 
                sum + (t.reviews?.length || 0), 0
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </div>
        </div>

        {/* Selected Therapists List */}
        <div className="space-y-3">
          <h4 className="font-medium">Your Selections:</h4>
          <div className="space-y-3">
            {selectedTherapistData.map((therapist) => (
              <div 
                key={therapist.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={therapist.user?.avatarUrl} />
                  <AvatarFallback>
                    {therapist.user?.firstName?.[0]}{therapist.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">
                      {therapist.user?.firstName} {therapist.user?.lastName}
                    </h5>
                    <Badge variant="outline" className="text-xs">
                      {therapist.matchScore}% match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{therapist.providerType}</span>
                    <span>₱{therapist.hourlyRate}/hr</span>
                    {therapist.reviews?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>
                          {(therapist.reviews.reduce((sum, r) => sum + r.rating, 0) / 
                            therapist.reviews.length).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Remove from selection by calling parent handler
                    // const newSelection = selectedTherapists.filter(id => id !== therapist.id);
                    // This would need to be passed as a prop or handled differently
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            What happens next?
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Your requests will be sent to the selected therapists</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Therapists will review your profile and respond within 24-48 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>You&apos;ll be notified when therapists accept your request</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>You can then schedule your first session</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              Ready to connect with {selectedTherapists.length} 
              {selectedTherapists.length === 1 ? ' therapist' : ' therapists'}
            </span>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onSkipForNow}
              disabled={isLoading}
            >
              Skip for now
            </Button>
            
            <Button 
              onClick={onSendRequests}
              disabled={isLoading || selectedTherapists.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Requests...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Requests ({selectedTherapists.length})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success Preview */}
        {!isLoading && (
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              After sending requests, you&apos;ll be redirected to your dashboard to track responses.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}