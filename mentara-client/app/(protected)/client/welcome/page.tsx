'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Removed unused import: Separator
import { 
  // Heart, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { TherapistRecommendationCard } from '@/components/client/TherapistRecommendationCard';
import { TherapistSelectionSummary } from '@/components/client/TherapistSelectionSummary';
import { CommunityRecommendationCard } from '@/components/client/CommunityRecommendationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ClientWelcomePage() {
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'loading' | 'recommendations' | 'selection' | 'sending' | 'communities' | 'joining' | 'complete'>('loading');

  // Fetch personalized recommendations
  const { 
    data: recommendations, 
    isLoading: recommendationsLoading, 
    error: recommendationsError,
    refetch: refetchRecommendations 
  } = useQuery({
    queryKey: ['therapist-recommendations', 'personalized'],
    queryFn: () => api.therapists.getPersonalizedRecommendations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch community recommendations (only when needed)
  const { 
    data: communityRecommendations, 
    isLoading: communityLoading, 
    error: communityError,
    refetch: refetchCommunities 
  } = useQuery({
    queryKey: ['community-recommendations', 'personalized'],
    queryFn: () => api.communities.getRecommendations(),
    enabled: currentStep === 'communities',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create therapist matches mutation (automatic matching)
  const createMatchesMutation = useMutation({
    mutationFn: (therapistIds: string[]) => 
      api.therapists.createMatches({ therapistIds }),
    onSuccess: () => {
      toast.success(`Successfully matched with ${selectedTherapists.length} therapist${selectedTherapists.length > 1 ? 's' : ''}!`);
      queryClient.invalidateQueries({ queryKey: ['user', 'therapist-matches'] });
      setCurrentStep('communities'); // Move to community recommendations
    },
    onError: () => {
      toast.error('Failed to create therapist matches. Please try again.');
    },
  });

  // Join communities mutation
  const joinCommunitiesMutation = useMutation({
    mutationFn: (communitySlugs: string[]) => 
      api.communities.joinCommunities(communitySlugs),
    onSuccess: (result) => {
      const successCount = result.data.successfulJoins.length;
      const failureCount = result.data.failedJoins.length;
      
      if (successCount > 0) {
        toast.success(`Successfully joined ${successCount} communities!`);
      }
      if (failureCount > 0) {
        toast.warning(`Could not join ${failureCount} communities`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['user', 'communities'] });
      setCurrentStep('complete');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/client?tab=communities');
      }, 2000);
    },
    onError: () => {
      toast.error('Failed to join communities. Please try again.');
    },
  });

  useEffect(() => {
    if (!recommendationsLoading && recommendations) {
      setCurrentStep('recommendations');
    }
  }, [recommendationsLoading, recommendations]);

  const handleTherapistSelect = (therapistId: string, selected: boolean) => {
    if (selected) {
      setSelectedTherapists(prev => [...prev, therapistId]);
    } else {
      setSelectedTherapists(prev => prev.filter(id => id !== therapistId));
    }
  };

  const handleCommunitySelect = (communitySlug: string, selected: boolean) => {
    if (selected) {
      setSelectedCommunities(prev => [...prev, communitySlug]);
    } else {
      setSelectedCommunities(prev => prev.filter(slug => slug !== communitySlug));
    }
  };

  const handleCreateMatches = async () => {
    if (selectedTherapists.length === 0) {
      toast.error('Please select at least one therapist');
      return;
    }

    setCurrentStep('sending');
    await createMatchesMutation.mutateAsync(selectedTherapists);
  };

  const handleJoinCommunities = async () => {
    if (selectedCommunities.length === 0) {
      // User can skip community joining
      setCurrentStep('complete');
      router.push('/client');
      return;
    }

    setCurrentStep('joining');
    await joinCommunitiesMutation.mutateAsync(selectedCommunities);
  };

  const handleSkipCommunities = () => {
    setCurrentStep('complete');
    router.push('/client');
  };

  const handleSkipForNow = () => {
    router.push('/client');
  };

  const maxSelections = 5;
  const selectionProgress = (selectedTherapists.length / maxSelections) * 100;

  if (recommendationsLoading || currentStep === 'loading' || (currentStep === 'communities' && communityLoading)) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          {currentStep === 'communities' && (
            <p className="text-muted-foreground">Finding personalized community recommendations...</p>
          )}
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendationsError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Recommendations</h2>
            <p className="text-muted-foreground mb-4">
              We&apos;re having trouble loading your therapist recommendations. Please try again.
            </p>
            <div className="space-y-2">
              <Button onClick={() => refetchRecommendations()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleSkipForNow} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'communities' && communityError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Community Recommendations</h2>
            <p className="text-muted-foreground mb-4">
              We&apos;re having trouble loading your community recommendations. You can skip this step for now.
            </p>
            <div className="space-y-2">
              <Button onClick={() => refetchCommunities()} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleSkipCommunities} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show community recommendations step
  if (currentStep === 'communities') {
    const maxCommunitySelections = 5;
    const communityProgress = (selectedCommunities.length / maxCommunitySelections) * 100;

    return (
      <div className="container mx-auto py-8 space-y-8">
        {/* Community Welcome Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-green-100 p-4 rounded-full">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="absolute -top-1 -right-1 bg-blue-500 h-6 w-6 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Join Supportive Communities</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your assessment, we&apos;ve found communities where you can connect with others 
              who understand your experience. Select communities you&apos;d like to join.
            </p>
          </div>

          {/* Community Progress Indicator */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Communities Selected</span>
              <span>{selectedCommunities.length}/{maxCommunitySelections}</span>
            </div>
            <Progress value={communityProgress} className="h-2" />
          </div>
        </div>

        {/* Community Recommendations */}
        {(communityRecommendations?.data?.length ?? 0) > 0 ? (
          <div className="space-y-6">
            {/* Match Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personalized Community Matches</h3>
                      <p className="text-sm text-muted-foreground">
                        Found {communityRecommendations?.data?.length || 0} communities based on your assessment
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    AI-Powered Matching
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Assessment-based matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Supportive communities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Instant joining (no approval needed)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Recommendation Cards */}
            <div className="grid gap-6">
              {(communityRecommendations?.data || []).map((community, index) => (
                <CommunityRecommendationCard
                  key={community.id}
                  community={community}
                  rank={index + 1}
                  isSelected={selectedCommunities.includes(community.slug)}
                  onSelect={(selected) => handleCommunitySelect(community.slug, selected)}
                  showMatchExplanation={true}
                  disabled={
                    !selectedCommunities.includes(community.slug) && 
                    selectedCommunities.length >= maxCommunitySelections
                  }
                />
              ))}
            </div>

            {/* Community Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Ready to join communities?</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCommunities.length > 0 
                        ? `You've selected ${selectedCommunities.length} communities to join`
                        : "You can skip this step if you prefer to explore communities later"
                      }
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSkipCommunities}>
                      Skip for Now
                    </Button>
                    <Button 
                      onClick={handleJoinCommunities}
                      disabled={joinCommunitiesMutation.isPending || currentStep === 'joining'}
                      className="min-w-32"
                    >
                      {currentStep === 'joining' ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : selectedCommunities.length > 0 ? (
                        <>
                          Join {selectedCommunities.length} Communities
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        'Continue to Dashboard'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // No community recommendations available
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Community Recommendations</h2>
              <p className="text-muted-foreground mb-4">
                We don&apos;t have any community recommendations available at the moment. 
                You can explore communities from your dashboard.
              </p>
              <Button onClick={handleSkipCommunities} className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show completion step
  if (currentStep === 'complete') {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome Complete!</h2>
            <p className="text-muted-foreground mb-4">
              You&apos;ve successfully set up your Mentara account. We&apos;re redirecting you to your dashboard.
            </p>
            <div className="animate-pulse">
              <RefreshCw className="h-5 w-5 mx-auto animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-primary/10 p-4 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 bg-green-500 h-6 w-6 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Mentara!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your assessment, we&apos;ve found therapists who are a great match for your needs. 
            Select up to {maxSelections} therapists you&apos;d like to connect with.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Therapists Selected</span>
            <span>{selectedTherapists.length}/{maxSelections}</span>
          </div>
          <Progress value={selectionProgress} className="h-2" />
        </div>
      </div>

      {/* Recommendations */}
      {(recommendations?.recommendations?.length ?? 0) > 0 ? (
        <div className="space-y-6">
          {/* Match Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized Matches</h3>
                    <p className="text-sm text-muted-foreground">
                      Found {recommendations?.recommendations?.length || 0} therapists matching your preferences
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {Math.round(recommendations?.averageMatchScore || 0)}% Average Match
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Assessment-based matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span>Verified therapists only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Available for sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Therapist Recommendations */}
          <div className="grid gap-6">
            {(recommendations?.recommendations || []).map((therapist, index) => (
              <TherapistRecommendationCard
                key={therapist.id}
                therapist={{...therapist.therapist, matchScore: therapist.score}}
                rank={index + 1}
                isSelected={selectedTherapists.includes(therapist.id)}
                onSelect={(selected) => handleTherapistSelect(therapist.id, selected)}
                showMatchExplanation={true}
                disabled={
                  !selectedTherapists.includes(therapist.id) && 
                  selectedTherapists.length >= maxSelections
                }
              />
            ))}
          </div>

          {/* Selection Summary & Actions */}
          {selectedTherapists.length > 0 && (
            <TherapistSelectionSummary
              selectedTherapists={selectedTherapists}
              therapists={recommendations?.recommendations || []}
              onSendRequests={handleCreateMatches}
              onSkipForNow={handleSkipForNow}
              isLoading={createMatchesMutation.isPending || currentStep === 'sending'}
            />
          )}

          {/* Skip Option for Zero Selection */}
          {selectedTherapists.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Not ready to choose yet?</h3>
                <p className="text-muted-foreground mb-4">
                  You can always find and connect with therapists from your dashboard later.
                </p>
                <Button variant="outline" onClick={handleSkipForNow}>
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // No recommendations available
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Recommendations Available</h2>
            <p className="text-muted-foreground mb-4">
              We don&apos;t have any therapist recommendations available at the moment. 
              You can browse all available therapists from your dashboard.
            </p>
            <Button onClick={() => router.push('/client/therapist')} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Browse All Therapists
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}