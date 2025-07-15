# 🎨 FRONTEND AGENT - MODULE 2 THERAPIST MATCHING DIRECTIVE

**From**: Project Manager  
**To**: Frontend Agent  
**Priority**: HIGH  
**Module**: 2 - Therapist Matching System  
**Estimated Time**: 10-12 hours  
**Date**: 2025-01-15  

## 🎯 **MISSION OBJECTIVE**

**PRIMARY GOAL**: Implement complete frontend user interfaces for end-to-end therapist matching system, including admin dashboard for therapist approvals, client welcome page with recommendations, and therapist request management system.

**MODULE SCOPE**: This is Module 2 of the mental health platform - the core therapist matching user experience that guides clients from first sign-in through therapist selection to successful connection.

**SUCCESS DEFINITION**: Seamless user experience supporting admin therapist approval workflow, client first-time welcome flow with intelligent recommendations, therapist selection and request system, and therapist dashboard for managing client requests.

---

## 📊 **CURRENT STATE ANALYSIS**

### **✅ Existing Foundation (BUILD UPON):**
- **Authentication System**: Clerk auth with role-based routing
- **Dashboard Layout**: Fixed sidebar and header with role-based navigation
- **Component Library**: shadcn/ui components with Tailwind CSS
- **API Integration**: React Query + Axios with useApi hook
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: Zustand for client state

### **❌ Missing Critical Components (IMPLEMENT THESE):**
1. **Admin Approval Interface**: No UI for managing therapist applications
2. **Client Welcome Page**: Missing first-time user onboarding with recommendations
3. **Therapist Selection UI**: No interface for clients to select and request therapists
4. **Therapist Request Dashboard**: Missing UI for therapists to manage client requests
5. **Real-time Updates**: No real-time notifications for matching events
6. **Enhanced Navigation**: Missing Module 2 specific routing and redirects

---

## 🚀 **3-PHASE IMPLEMENTATION STRATEGY**

### **PHASE 1: ADMIN APPROVAL INTERFACE** ⚡ (3-4 hours)

**Objective**: Enable admins to efficiently manage therapist applications with comprehensive approval workflow.

#### **1.1 Admin Therapist Management Dashboard**

**Create `app/(protected)/admin/therapists/page.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TherapistApplicationCard } from '@/components/admin/TherapistApplicationCard';
import { TherapistApplicationDetails } from '@/components/admin/TherapistApplicationDetails';
import { BulkActionsBar } from '@/components/admin/BulkActionsBar';
import { TherapistStatistics } from '@/components/admin/TherapistStatistics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface TherapistFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  province?: string;
  submittedAfter?: string;
  processedBy?: string;
  providerType?: string;
  limit?: number;
}

export default function AdminTherapistManagementPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<TherapistFilters>({
    status: 'pending',
    limit: 50,
  });
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [detailsTherapistId, setDetailsTherapistId] = useState<string | null>(null);

  // Fetch pending applications
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['admin', 'therapists', 'applications', filters],
    queryFn: () => api.admin.getTherapistApplications(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['admin', 'therapists', 'statistics'],
    queryFn: () => api.admin.getTherapistStatistics(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Approve therapist mutation
  const approveMutation = useMutation({
    mutationFn: ({ therapistId, data }: { therapistId: string; data: any }) =>
      api.admin.approveTherapist(therapistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'therapists'] });
      toast.success('Therapist approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve therapist');
      console.error('Approval error:', error);
    },
  });

  // Reject therapist mutation
  const rejectMutation = useMutation({
    mutationFn: ({ therapistId, data }: { therapistId: string; data: any }) =>
      api.admin.rejectTherapist(therapistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'therapists'] });
      toast.success('Therapist application rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject therapist');
      console.error('Rejection error:', error);
    },
  });

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handleBulkApprove = async () => {
    for (const therapistId of selectedTherapists) {
      await approveMutation.mutateAsync({
        therapistId,
        data: { approvalMessage: 'Bulk approval processed' },
      });
    }
    setSelectedTherapists([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Failed to load therapist applications. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Therapist Applications</h1>
          <p className="text-muted-foreground">Manage therapist applications and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && <TherapistStatistics statistics={statistics} />}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Province"
              value={filters.province || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, province: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="Submitted After"
              value={filters.submittedAfter || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, submittedAfter: e.target.value }))}
            />

            <Input
              placeholder="Provider Type"
              value={filters.providerType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, providerType: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTherapists.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTherapists.length}
          onBulkApprove={handleBulkApprove}
          onBulkReject={() => {/* Implement bulk reject */}}
          onClearSelection={() => setSelectedTherapists([])}
        />
      )}

      {/* Applications List */}
      <div className="grid gap-4">
        {applications?.therapists?.map((therapist) => (
          <TherapistApplicationCard
            key={therapist.userId}
            therapist={therapist}
            isSelected={selectedTherapists.includes(therapist.userId)}
            onSelect={(id, selected) => {
              if (selected) {
                setSelectedTherapists(prev => [...prev, id]);
              } else {
                setSelectedTherapists(prev => prev.filter(x => x !== id));
              }
            }}
            onViewDetails={() => setDetailsTherapistId(therapist.userId)}
            onApprove={(data) => approveMutation.mutate({ therapistId: therapist.userId, data })}
            onReject={(data) => rejectMutation.mutate({ therapistId: therapist.userId, data })}
          />
        ))}
      </div>

      {/* Application Details Modal */}
      {detailsTherapistId && (
        <TherapistApplicationDetails
          therapistId={detailsTherapistId}
          onClose={() => setDetailsTherapistId(null)}
          onApprove={(data) => {
            approveMutation.mutate({ therapistId: detailsTherapistId, data });
            setDetailsTherapistId(null);
          }}
          onReject={(data) => {
            rejectMutation.mutate({ therapistId: detailsTherapistId, data });
            setDetailsTherapistId(null);
          }}
        />
      )}
    </div>
  );
}
```

#### **1.2 Therapist Application Components**

**Create `components/admin/TherapistApplicationCard.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CalendarDays, 
  MapPin, 
  GraduationCap, 
  Clock, 
  Star,
  Eye,
  Check,
  X 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ApprovalDialog } from './ApprovalDialog';
import { RejectionDialog } from './RejectionDialog';

interface TherapistApplicationCardProps {
  therapist: any;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onViewDetails: () => void;
  onApprove: (data: any) => void;
  onReject: (data: any) => void;
}

export function TherapistApplicationCard({
  therapist,
  isSelected,
  onSelect,
  onViewDetails,
  onApprove,
  onReject,
}: TherapistApplicationCardProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'suspended': return 'gray';
      default: return 'gray';
    }
  };

  const yearsOfExperience = therapist.practiceStartDate 
    ? new Date().getFullYear() - new Date(therapist.practiceStartDate).getFullYear()
    : 0;

  return (
    <>
      <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(therapist.userId, !!checked)}
              />
              
              <Avatar className="h-12 w-12">
                <AvatarImage src={therapist.user.avatarUrl} />
                <AvatarFallback>
                  {therapist.user.firstName?.[0]}{therapist.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {therapist.user.firstName} {therapist.user.lastName}
                  </h3>
                  <Badge variant={getStatusColor(therapist.status)}>
                    {therapist.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{therapist.user.email}</p>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {therapist.province}
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {therapist.providerType}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {yearsOfExperience} years experience
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    Applied {formatDistanceToNow(new Date(therapist.submissionDate), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              
              {therapist.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowApprovalDialog(true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowRejectionDialog(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">License:</span>
              <p className="text-muted-foreground">{therapist.prcLicenseNumber}</p>
            </div>
            <div>
              <span className="font-medium">Specializations:</span>
              <p className="text-muted-foreground">
                {therapist.areasOfExpertise?.slice(0, 2).join(', ')}
                {therapist.areasOfExpertise?.length > 2 && ' +more'}
              </p>
            </div>
            <div>
              <span className="font-medium">Rate:</span>
              <p className="text-muted-foreground">₱{therapist.hourlyRate}/hour</p>
            </div>
            <div>
              <span className="font-medium">Session Length:</span>
              <p className="text-muted-foreground">{therapist.sessionLength} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApprovalDialog
        open={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        onApprove={onApprove}
        therapistName={`${therapist.user.firstName} ${therapist.user.lastName}`}
      />

      <RejectionDialog
        open={showRejectionDialog}
        onClose={() => setShowRejectionDialog(false)}
        onReject={onReject}
        therapistName={`${therapist.user.firstName} ${therapist.user.lastName}`}
      />
    </>
  );
}
```

### **PHASE 2: CLIENT WELCOME PAGE & THERAPIST SELECTION** ⚡ (4-5 hours)

**Objective**: Create seamless onboarding experience for first-time clients with intelligent therapist recommendations.

#### **2.1 Welcome Page with Recommendations**

**Create `app/(protected)/client/welcome/page.tsx`:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TherapistRecommendationCard } from '@/components/client/TherapistRecommendationCard';
import { WelcomeHeader } from '@/components/client/WelcomeHeader';
import { SelectionGuidance } from '@/components/client/SelectionGuidance';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Heart, Star, Clock, MapPin } from 'lucide-react';

export default function ClientWelcomePage() {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user should be on welcome page
  const { data: firstSignInStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['auth', 'first-sign-in-status'],
    queryFn: () => api.auth.getFirstSignInStatus(),
  });

  // Fetch welcome page recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['therapist-recommendations', 'welcome'],
    queryFn: () => api.therapists.getWelcomePageRecommendations({ limit: 6 }),
    enabled: firstSignInStatus?.needsWelcomeFlow,
  });

  // Send therapist requests mutation
  const sendRequestsMutation = useMutation({
    mutationFn: (data: { therapistIds: string[]; message?: string }) =>
      api.client.sendMultipleTherapistRequests(data),
    onSuccess: () => {
      toast.success('Requests sent successfully!');
      // Mark recommendations as seen
      markSeenMutation.mutate();
    },
    onError: (error) => {
      toast.error('Failed to send requests');
      console.error('Request error:', error);
      setIsSubmitting(false);
    },
  });

  // Mark recommendations as seen mutation
  const markSeenMutation = useMutation({
    mutationFn: () => api.auth.markRecommendationsSeen(),
    onSuccess: () => {
      // Redirect to client dashboard
      router.push('/client/dashboard');
    },
  });

  // Redirect if user has already seen recommendations
  useEffect(() => {
    if (firstSignInStatus && !firstSignInStatus.needsWelcomeFlow) {
      router.push('/client/dashboard');
    }
  }, [firstSignInStatus, router]);

  const handleTherapistSelection = (therapistId: string, selected: boolean) => {
    if (selected) {
      setSelectedTherapists(prev => [...prev, therapistId]);
    } else {
      setSelectedTherapists(prev => prev.filter(id => id !== therapistId));
    }
  };

  const handleSendRequests = async () => {
    if (selectedTherapists.length === 0) {
      toast.error('Please select at least one therapist');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await sendRequestsMutation.mutateAsync({
        therapistIds: selectedTherapists,
        message: requestMessage.trim() || undefined,
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleSkipForNow = () => {
    markSeenMutation.mutate();
  };

  if (statusLoading || recommendationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!firstSignInStatus?.needsWelcomeFlow) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <WelcomeHeader 
        welcomeMessage={recommendations?.welcomeMessage}
        userConditions={recommendations?.userConditions}
        memberSince={firstSignInStatus.memberSince}
      />

      <div className="space-y-6">
        {/* Selection Guidance */}
        <SelectionGuidance 
          guidance={recommendations?.selectionGuidance}
          nextSteps={recommendations?.nextSteps}
          therapistCount={recommendations?.therapists?.length || 0}
        />

        {/* Therapist Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations?.therapists?.map((therapist, index) => (
            <TherapistRecommendationCard
              key={therapist.userId}
              therapist={therapist}
              rank={index + 1}
              isSelected={selectedTherapists.includes(therapist.userId)}
              onSelect={(selected) => handleTherapistSelection(therapist.userId, selected)}
              showMatchExplanation={true}
            />
          ))}
        </div>

        {/* Selection Summary & Actions */}
        {selectedTherapists.length > 0 && (
          <Card className="sticky bottom-4 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Selected {selectedTherapists.length} therapist{selectedTherapists.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We'll send your request to the selected therapists
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {selectedTherapists.length} selected
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Optional message to therapists:
                  </label>
                  <Textarea
                    placeholder="Introduce yourself or share what you're looking for in therapy..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {requestMessage.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSendRequests}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Sending Requests...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Send Requests
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={handleSkipForNow}>
                    Skip for now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
```

#### **2.2 Therapist Recommendation Components**

**Create `components/client/TherapistRecommendationCard.tsx`:**
```typescript
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Heart,
  Award,
  Users,
  TrendingUp 
} from 'lucide-react';

interface TherapistRecommendationCardProps {
  therapist: any;
  rank: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  showMatchExplanation?: boolean;
}

export function TherapistRecommendationCard({
  therapist,
  rank,
  isSelected,
  onSelect,
  showMatchExplanation = false,
}: TherapistRecommendationCardProps) {
  const matchScore = therapist.matchScore || 0;
  const averageRating = therapist.reviews?.length > 0 
    ? therapist.reviews.reduce((sum, r) => sum + r.rating, 0) / therapist.reviews.length 
    : 0;

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Moderate Match';
  };

  return (
    <Card className={`transition-all cursor-pointer hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary shadow-md' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            #{rank} Recommended
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
          />
        </div>
        
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={therapist.user?.avatarUrl} />
            <AvatarFallback>
              {therapist.user?.firstName?.[0]}{therapist.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {therapist.user?.firstName} {therapist.user?.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{therapist.providerType}</p>
            
            <div className="flex items-center gap-2 mt-1">
              {averageRating > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({therapist.reviews?.length})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Match Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Compatibility</span>
            <span className={`font-semibold ${getMatchColor(matchScore)}`}>
              {matchScore}% {getMatchLevel(matchScore)}
            </span>
          </div>
          <Progress value={matchScore} className="h-2" />
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{therapist.province}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>₱{therapist.hourlyRate}/hr</span>
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>{therapist.yearsOfExperience || 0}+ years</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{therapist.assignedClients?.length || 0} clients</span>
          </div>
        </div>

        {/* Specializations */}
        <div>
          <p className="text-sm font-medium mb-2">Specializations:</p>
          <div className="flex flex-wrap gap-1">
            {therapist.areasOfExpertise?.slice(0, 3).map((area, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
            {therapist.areasOfExpertise?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{therapist.areasOfExpertise.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Match Explanation */}
        {showMatchExplanation && therapist.matchExplanation && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Why this therapist:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              {therapist.matchExplanation.primaryMatches?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-green-600" />
                  <span>Specializes in your primary concerns</span>
                </div>
              )}
              {therapist.matchExplanation.experienceYears > 5 && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-blue-600" />
                  <span>Highly experienced ({therapist.matchExplanation.experienceYears} years)</span>
                </div>
              )}
              {therapist.matchExplanation.averageRating > 4.5 && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-yellow-600" />
                  <span>Excellent client reviews</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selection Actions */}
        <div className="pt-2">
          <Button
            variant={isSelected ? "default" : "outline"}
            className="w-full"
            onClick={() => onSelect(!isSelected)}
          >
            {isSelected ? (
              <>
                <Heart className="h-4 w-4 mr-2 fill-current" />
                Selected
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Select Therapist
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **PHASE 3: THERAPIST REQUEST MANAGEMENT** ⚡ (3-4 hours)

**Objective**: Enable therapists to efficiently manage incoming client requests and respond appropriately.

#### **3.1 Therapist Request Dashboard**

**Create `app/(protected)/therapist/requests/page.tsx`:**
```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientRequestCard } from '@/components/therapist/ClientRequestCard';
import { RequestResponseDialog } from '@/components/therapist/RequestResponseDialog';
import { RequestStatistics } from '@/components/therapist/RequestStatistics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Bell, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

interface RequestFilters {
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  limit?: number;
}

export default function TherapistRequestsPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<RequestFilters>({
    status: 'PENDING',
    limit: 20,
  });
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseType, setResponseType] = useState<'accept' | 'decline' | null>(null);

  // Fetch therapist requests
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['therapist', 'requests', filters],
    queryFn: () => api.therapist.getClientRequests(filters),
    refetchInterval: 30000, // Refresh every 30 seconds for pending requests
  });

  // Fetch request statistics
  const { data: statistics } = useQuery({
    queryKey: ['therapist', 'request-statistics'],
    queryFn: () => api.therapist.getRequestStatistics(),
    refetchInterval: 60000,
  });

  // Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: any }) =>
      api.therapist.acceptClientRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['therapist', 'request-statistics'] });
      toast.success('Client request accepted successfully');
      setSelectedRequest(null);
      setResponseType(null);
    },
    onError: (error) => {
      toast.error('Failed to accept client request');
      console.error('Accept error:', error);
    },
  });

  // Decline request mutation
  const declineMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: any }) =>
      api.therapist.declineClientRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['therapist', 'request-statistics'] });
      toast.success('Client request declined');
      setSelectedRequest(null);
      setResponseType(null);
    },
    onError: (error) => {
      toast.error('Failed to decline client request');
      console.error('Decline error:', error);
    },
  });

  const handleAcceptRequest = (request: any) => {
    setSelectedRequest(request);
    setResponseType('accept');
  };

  const handleDeclineRequest = (request: any) => {
    setSelectedRequest(request);
    setResponseType('decline');
  };

  const handleSubmitResponse = (responseData: any) => {
    if (!selectedRequest) return;

    const mutation = responseType === 'accept' ? acceptMutation : declineMutation;
    mutation.mutate({
      requestId: selectedRequest.id,
      data: {
        ...responseData,
        acceptClient: responseType === 'accept',
      },
    });
  };

  const getRequestCountByStatus = (status: string) => {
    return requests?.requests?.filter(r => r.status === status).length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Failed to load client requests. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Requests</h1>
          <p className="text-muted-foreground">Manage incoming client connection requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && <RequestStatistics statistics={statistics} />}

      {/* Request Status Tabs */}
      <Tabs value={filters.status || 'PENDING'} onValueChange={(value) => 
        setFilters(prev => ({ ...prev, status: value as any }))
      }>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="PENDING" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Pending
            {getRequestCountByStatus('PENDING') > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {getRequestCountByStatus('PENDING')}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ACCEPTED">
            <CheckCircle className="h-4 w-4 mr-2" />
            Accepted
          </TabsTrigger>
          <TabsTrigger value="DECLINED">
            <XCircle className="h-4 w-4 mr-2" />
            Declined
          </TabsTrigger>
          <TabsTrigger value="EXPIRED">
            <Clock className="h-4 w-4 mr-2" />
            Expired
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filters.status || 'PENDING'} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                    <SelectItem value="NORMAL">Normal Priority</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.limit?.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Results per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 requests</SelectItem>
                    <SelectItem value="20">20 requests</SelectItem>
                    <SelectItem value="50">50 requests</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ status: 'PENDING', limit: 20 })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div className="space-y-4">
            {requests?.requests?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No {filters.status?.toLowerCase()} requests</h3>
                  <p className="text-muted-foreground">
                    {filters.status === 'PENDING' 
                      ? "You don't have any pending client requests at the moment."
                      : `No ${filters.status?.toLowerCase()} requests found.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              requests?.requests?.map((request) => (
                <ClientRequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAcceptRequest(request)}
                  onDecline={() => handleDeclineRequest(request)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      {selectedRequest && responseType && (
        <RequestResponseDialog
          open={!!selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            setResponseType(null);
          }}
          request={selectedRequest}
          responseType={responseType}
          onSubmit={handleSubmitResponse}
          isSubmitting={acceptMutation.isPending || declineMutation.isPending}
        />
      )}
    </div>
  );
}
```

---

## 🔄 **NAVIGATION & ROUTING UPDATES**

### **Middleware Enhancement for First-time Flow**

**Update `middleware.ts`:**
```typescript
// Add after existing middleware logic
if (isAuthenticated && pathname.startsWith('/client')) {
  // Check if client needs welcome flow
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/first-sign-in-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (response.ok) {
    const { needsWelcomeFlow } = await response.json();
    
    // Redirect to welcome page if needed (except if already on welcome page)
    if (needsWelcomeFlow && !pathname.includes('/welcome')) {
      return NextResponse.redirect(new URL('/client/welcome', request.url));
    }
    
    // Redirect away from welcome page if not needed
    if (!needsWelcomeFlow && pathname.includes('/welcome')) {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
  }
}
```

### **Enhanced Navigation Menu**

**Update `components/layout/Sidebar.tsx` for Module 2 routes:**
```typescript
// Add to navigation items based on user role
const clientNavItems = [
  // ... existing items ...
  {
    title: "Find Therapists",
    href: "/client/therapists",
    icon: Users,
    description: "Browse and connect with therapists"
  },
  {
    title: "My Requests",
    href: "/client/requests",
    icon: Heart,
    description: "Manage your therapist connection requests"
  },
];

const therapistNavItems = [
  // ... existing items ...
  {
    title: "Client Requests",
    href: "/therapist/requests",
    icon: Bell,
    description: "Manage incoming client requests",
    badge: pendingRequestCount > 0 ? pendingRequestCount : undefined,
  },
];

const adminNavItems = [
  // ... existing items ...
  {
    title: "Therapist Applications",
    href: "/admin/therapists",
    icon: UserCheck,
    description: "Review and approve therapist applications",
    badge: pendingApplicationCount > 0 ? pendingApplicationCount : undefined,
  },
];
```

---

## 📊 **API INTEGRATION ENHANCEMENTS**

### **Enhanced API Services**

**Update `lib/api/services/admin.ts`:**
```typescript
import { AdminApiClient } from './admin-api-client';

export class AdminService {
  // ... existing methods ...

  // Therapist management
  async getTherapistApplications(filters: PendingTherapistFiltersDto) {
    return this.client.get('/admin/therapists/applications', { params: filters });
  }

  async getPendingTherapistApplications(filters: PendingTherapistFiltersDto) {
    return this.client.get('/admin/therapists/pending', { params: filters });
  }

  async getTherapistApplicationDetails(therapistId: string) {
    return this.client.get(`/admin/therapists/${therapistId}/details`);
  }

  async approveTherapist(therapistId: string, data: ApproveTherapistDto) {
    return this.client.post(`/admin/therapists/${therapistId}/approve`, data);
  }

  async rejectTherapist(therapistId: string, data: RejectTherapistDto) {
    return this.client.post(`/admin/therapists/${therapistId}/reject`, data);
  }

  async updateTherapistStatus(therapistId: string, data: UpdateTherapistStatusDto) {
    return this.client.put(`/admin/therapists/${therapistId}/status`, data);
  }

  async getTherapistStatistics() {
    return this.client.get('/admin/therapists/statistics');
  }
}
```

**Update `lib/api/services/client.ts`:**
```typescript
export class ClientService {
  // ... existing methods ...

  // Therapist requests
  async sendTherapistRequest(therapistId: string, data: SendTherapistRequestDto) {
    return this.client.post(`/client/requests/therapist/${therapistId}`, data);
  }

  async sendMultipleTherapistRequests(data: { therapistIds: string[]; message?: string; priority?: string }) {
    return this.client.post('/client/requests/therapists/bulk', data);
  }

  async getClientRequests(filters: ClientRequestFiltersDto) {
    return this.client.get('/client/requests', { params: filters });
  }

  async cancelRequest(requestId: string) {
    return this.client.put(`/client/requests/${requestId}/cancel`);
  }

  async getClientRequestStatistics() {
    return this.client.get('/client/requests/statistics');
  }
}
```

**Update `lib/api/services/therapist.ts`:**
```typescript
export class TherapistService {
  // ... existing methods ...

  // Client requests
  async getClientRequests(filters: TherapistRequestFiltersDto) {
    return this.client.get('/therapist/requests', { params: filters });
  }

  async acceptClientRequest(requestId: string, data: TherapistRequestResponseDto) {
    return this.client.put(`/therapist/requests/${requestId}/accept`, data);
  }

  async declineClientRequest(requestId: string, data: TherapistRequestResponseDto) {
    return this.client.put(`/therapist/requests/${requestId}/decline`, data);
  }

  async getTherapistRequestStatistics() {
    return this.client.get('/therapist/requests/statistics');
  }
}
```

**Update `lib/api/services/auth.ts`:**
```typescript
export class AuthService {
  // ... existing methods ...

  // First-time flow
  async getFirstSignInStatus() {
    return this.client.get('/auth/first-sign-in-status');
  }

  async markRecommendationsSeen() {
    return this.client.put('/auth/mark-recommendations-seen');
  }
}
```

---

## 🎯 **SUCCESS CRITERIA & VALIDATION**

### **Phase 1 Success Criteria:**
- [ ] Admin can view pending therapist applications in organized interface
- [ ] Admin can approve therapists with custom messages and license verification
- [ ] Admin can reject therapists with reasons and feedback
- [ ] Admin can filter and search applications efficiently
- [ ] Bulk actions working for multiple therapist applications
- [ ] Real-time statistics and application counts displayed
- [ ] Responsive design working on all devices

### **Phase 2 Success Criteria:**
- [ ] First-time clients automatically redirected to welcome page
- [ ] Welcome page displays personalized therapist recommendations
- [ ] Clients can select multiple therapists and send requests
- [ ] Request messages are optional but encouraged
- [ ] Smooth transition from welcome page to main dashboard
- [ ] Skip option available for clients who want to explore first
- [ ] Match explanations help clients understand recommendations

### **Phase 3 Success Criteria:**
- [ ] Therapists can view all incoming client requests organized by status
- [ ] Therapists can accept requests with custom response messages
- [ ] Therapists can decline requests with professional feedback
- [ ] Real-time updates for new requests and status changes
- [ ] Request prioritization and filtering working correctly
- [ ] Statistics dashboard providing meaningful insights

### **Integration Success Criteria:**
- [ ] Smooth navigation between all Module 2 interfaces
- [ ] Consistent design language across all components
- [ ] Proper error handling with user-friendly messages
- [ ] Loading states enhance user experience
- [ ] Mobile-responsive design on all screen sizes
- [ ] Accessibility standards met (WCAG 2.1)

---

## 🚀 **EXECUTION CHECKLIST**

### **Pre-Implementation:**
- [ ] Verify Backend Agent has completed API implementation
- [ ] Ensure mentara-commons types are available in frontend
- [ ] Test API endpoints with proper authentication

### **Implementation Order:**
1. **Start with Phase 1**: Admin approval interface (foundational)
2. **Then Phase 2**: Client welcome page and recommendations (core UX)
3. **Finally Phase 3**: Therapist request management (completion)
4. **Integration**: Navigation, routing, and final polish

### **Component Development Guidelines:**
- Use existing shadcn/ui components for consistency
- Follow established patterns from other dashboard pages
- Implement proper loading and error states
- Add accessibility attributes (aria-labels, etc.)
- Test on mobile devices throughout development

### **Testing Requirements:**
- [ ] Test entire admin approval workflow
- [ ] Test first-time client onboarding flow end-to-end
- [ ] Test therapist request acceptance/decline flow
- [ ] Verify real-time updates work correctly
- [ ] Test error scenarios and edge cases
- [ ] Cross-browser compatibility testing

---

**⚡ This directive completes the frontend user experience for Module 2 therapist matching. Execute in coordination with Backend Agent completion for seamless integration.**

---

*Directive Created: 2025-01-15 by Project Manager*  
*Execution Status: ⏳ **AWAITING BACKEND COMPLETION***  
*Module**: 2 - Therapist Matching System (Frontend)*