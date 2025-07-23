'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useWelcomeRecommendations } from '@/hooks/therapist/useRecommendedTherapists';
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

  // Use unified hook for recommendations
  const { 
    therapists: recommendedTherapists,
    communities: recommendedCommunities,
    isLoading: recommendationsLoading, 
    error: recommendationsError,
    refetch: refetchRecommendations,
    welcomeMessage,
    isFirstTime,
    averageMatchScore
  } = useWelcomeRecommendations();

  // Communities are now included in the main recommendations response

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
    if (!recommendationsLoading && recommendedTherapists) {
      // Debug logging for received recommendations
      console.log('[DEBUG] Welcome page received recommendations:', {
        recommendationsCount: recommendedTherapists?.length || 0,
        communitiesCount: recommendedCommunities?.length || 0,
        hasWelcomeMessage: !!welcomeMessage,
      });
      setCurrentStep('recommendations');
    }
  }, [recommendationsLoading, recommendedTherapists, recommendedCommunities, welcomeMessage]);

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

  if (recommendationsLoading || currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
        <div className="container mx-auto py-12 space-y-12">
          {/* Enhanced Loading Header */}
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-full border border-blue-200/50 backdrop-blur-sm shadow-lg">
                  <Sparkles className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-12 w-80 mx-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              <Skeleton className="h-6 w-96 mx-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              <p className="text-blue-600 font-medium animate-pulse">Discovering your perfect therapist matches...</p>
            </div>

            {/* Enhanced Loading Progress */}
            <div className="max-w-lg mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-lg">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    Processing your preferences
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                    Please wait...
                  </span>
                </div>
                <div className="relative">
                  <div className="h-3 bg-gray-100/80 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-500">
                  Analyzing your perfect matches...
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Loading Cards */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                    <Skeleton className="w-5 h-5 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                        <Skeleton className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                        <Skeleton className="h-4 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-10 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

  // Community error handling removed since communities are included in main response

  // Show community recommendations step
  if (currentStep === 'communities') {
    const maxCommunitySelections = 5;
    const communityProgress = (selectedCommunities.length / maxCommunitySelections) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/20">
        <div className="container mx-auto py-12 space-y-12">
          {/* Enhanced Community Welcome Header */}
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6 rounded-full border border-emerald-200/50 backdrop-blur-sm shadow-lg">
                  <Users className="h-10 w-10 text-emerald-600" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 to-indigo-500 h-8 w-8 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="inline-block">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-800 bg-clip-text text-transparent mb-4 leading-tight">
                  Join Supportive Communities
                </h1>
                <div className="h-1 w-40 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto rounded-full"></div>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Based on your assessment, we&apos;ve discovered 
                <span className="text-emerald-600 font-semibold"> meaningful communities</span> where you can connect with others 
                who truly understand your journey. Select the communities you&apos;d like to join.
              </p>
            </div>

            {/* Enhanced Community Progress Indicator */}
            <div className="max-w-lg mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50 shadow-lg">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Communities Selected
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {selectedCommunities.length}/{maxCommunitySelections}
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={communityProgress} 
                    className="h-3 bg-gray-100/80 rounded-full"
                  />
                  <div 
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${communityProgress}%` }}
                  />
                </div>
                {communityProgress > 0 && (
                  <p className="text-xs text-center mt-2 text-gray-500">
                    Excellent choices! {selectedCommunities.length > 0 && `${Math.round(communityProgress)}% complete`}
                  </p>
                )}
              </div>
            </div>
          </div>

        {/* Community Recommendations */}
        {(recommendedCommunities?.length ?? 0) > 0 ? (
          <div className="space-y-6">
            {/* Enhanced Community Match Summary */}
            <Card className="bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/80 border-emerald-200/50 shadow-xl backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-blue-500 p-3 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Personalized Community Matches</h3>
                      <p className="text-gray-600 font-medium">
                        Found {recommendedCommunities?.length || 0} meaningful communities based on your unique assessment
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                    AI-Powered Matching
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-700">Smart assessment matching</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-700">Supportive communities</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-700">Instant joining available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Recommendation Cards */}
            <div className="grid gap-6">
              {(recommendedCommunities || []).map((community, index) => (
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      <div className="container mx-auto py-12 space-y-12">
        {/* Enhanced Welcome Header */}
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl group-hover:opacity-30 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-full border border-blue-200/50 backdrop-blur-sm shadow-lg">
                <Sparkles className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 h-8 w-8 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="inline-block">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 leading-tight">
                Welcome to Mentara!
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Based on your personalized assessment, we&apos;ve discovered therapists who are 
              <span className="text-blue-600 font-semibold"> perfectly matched</span> to your unique needs. 
              Select up to {maxSelections} therapists you&apos;d like to connect with.
            </p>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-lg">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Therapists Selected
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {selectedTherapists.length}/{maxSelections}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={selectionProgress} 
                  className="h-3 bg-gray-100/80 rounded-full"
                />
                <div 
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${selectionProgress}%` }}
                />
              </div>
              {selectionProgress > 0 && (
                <p className="text-xs text-center mt-2 text-gray-500">
                  Great progress! {selectedTherapists.length > 0 && `${Math.round(selectionProgress)}% complete`}
                </p>
              )}
            </div>
          </div>
        </div>

      {/* Recommendations */}
      {(recommendedTherapists?.length ?? 0) > 0 ? (
        <div className="space-y-6">
          {/* Enhanced Match Summary */}
          <Card className="bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 border-blue-200/50 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Personalized Matches</h3>
                    <p className="text-gray-600 font-medium">
                      Found {recommendedTherapists?.length || 0} exceptional therapists matching your unique preferences
                    </p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                  {Math.round(averageMatchScore || 0)}% Match Score
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">AI-powered matching</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">Verified professionals</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">Available for sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Therapist Recommendations */}
          <div className="grid gap-6">
            {(recommendedTherapists || []).map((therapist, index) => (
              <TherapistRecommendationCard
                key={therapist.id}
                therapist={therapist}
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
              therapists={recommendedTherapists || []}
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
    </div>
  );
}