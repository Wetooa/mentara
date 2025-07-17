'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Heart,
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Phone,
  Video,
  MoreHorizontal,
  Trash2,
  Eye,
  Compare,
  Clock,
  DollarSign,
  X,
  CheckCircle,
  Users,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface ShortlistedTherapist {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  location: string;
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  matchingScore: number;
  isAvailable: boolean;
  nextAvailableSlot?: string;
  addedAt: string;
  notes?: string;
  sessionFormats: string[];
}

interface TherapistShortlistProps {
  shortlistedTherapists: ShortlistedTherapist[];
  onRemoveFromShortlist: (therapistId: string) => void;
  onContactTherapist: (therapistId: string) => void;
  onViewProfile: (therapistId: string) => void;
  onBookConsultation: (therapistId: string) => void;
  onCompareTherapists: (therapistIds: string[]) => void;
  onAddNote: (therapistId: string, note: string) => void;
  maxShortlistSize?: number;
  className?: string;
}

export function TherapistShortlist({
  shortlistedTherapists,
  onRemoveFromShortlist,
  onContactTherapist,
  onViewProfile,
  onBookConsultation,
  onCompareTherapists,
  onAddNote,
  maxShortlistSize = 5,
  className
}: TherapistShortlistProps) {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [therapistToRemove, setTherapistToRemove] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getMatchingScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleComparisonToggle = (therapistId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(therapistId)
        ? prev.filter(id => id !== therapistId)
        : [...prev, therapistId].slice(0, 3) // Max 3 for comparison
    );
  };

  const handleCompareSelected = () => {
    if (selectedForComparison.length >= 2) {
      onCompareTherapists(selectedForComparison);
      setSelectedForComparison([]);
    }
  };

  const confirmRemoval = (therapistId: string) => {
    onRemoveFromShortlist(therapistId);
    setTherapistToRemove(null);
  };

  if (shortlistedTherapists.length === 0) {
    return (
      <Card className={cn('border border-border/50', className)}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Your Shortlist is Empty</CardTitle>
          <CardDescription>
            Add therapists to your shortlist to compare them and make your decision easier.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            💡 Tip: Click the heart icon on therapist cards to add them to your shortlist
          </p>
          <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <ArrowRight className="h-4 w-4 rotate-180" />
            Browse Therapists
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card className="border border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Your Shortlist
                <Badge variant="secondary">
                  {shortlistedTherapists.length}/{maxShortlistSize}
                </Badge>
              </CardTitle>
              <CardDescription>
                Therapists you&apos;ve saved for consideration. Compare them to make your final choice.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Comparison Bar */}
        {selectedForComparison.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <Compare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {selectedForComparison.length} selected for comparison
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedForComparison([])}
                >
                  Clear
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCompareSelected}
                  disabled={selectedForComparison.length < 2}
                >
                  Compare ({selectedForComparison.length})
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Shortlisted Therapists */}
      <div className="space-y-3">
        {shortlistedTherapists.map((therapist) => (
          <Card 
            key={therapist.id} 
            className={cn(
              'border transition-all duration-200 hover:shadow-md',
              selectedForComparison.includes(therapist.id)
                ? 'border-primary/50 bg-primary/5'
                : 'border-border/50'
            )}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={therapist.profileImage} />
                    <AvatarFallback>
                      {therapist.firstName[0]}{therapist.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Comparison Checkbox */}
                  <button
                    onClick={() => handleComparisonToggle(therapist.id)}
                    className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedForComparison.includes(therapist.id)
                        ? "bg-primary border-primary text-white"
                        : "bg-white border-gray-300 hover:border-primary"
                    )}
                  >
                    {selectedForComparison.includes(therapist.id) && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {therapist.firstName} {therapist.lastName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{therapist.rating.toFixed(1)} ({therapist.totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{therapist.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{therapist.experience} years</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewProfile(therapist.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onContactTherapist(therapist.id)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setTherapistToRemove(therapist.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Shortlist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge className={cn('text-xs', getMatchingScoreColor(therapist.matchingScore))}>
                      {therapist.matchingScore}% match
                    </Badge>
                    {therapist.isAvailable ? (
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-700">
                        Limited Availability
                      </Badge>
                    )}
                    {therapist.specialties.slice(0, 2).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {therapist.bio}
                  </p>

                  {/* Session Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          {formatCurrency(therapist.pricing.min)} - {formatCurrency(therapist.pricing.max)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {therapist.sessionFormats.includes('video') && <Video className="h-3 w-3" />}
                        {therapist.sessionFormats.includes('phone') && <Phone className="h-3 w-3" />}
                        {therapist.sessionFormats.includes('in-person') && <Users className="h-3 w-3" />}
                      </div>
                    </div>
                    
                    {therapist.nextAvailableSlot && (
                      <div className="text-xs text-green-600">
                        Next available: {therapist.nextAvailableSlot}
                      </div>
                    )}
                  </div>

                  {/* Added Date */}
                  <div className="text-xs text-muted-foreground mb-3">
                    Added {formatDistanceToNow(new Date(therapist.addedAt), { addSuffix: true })}
                  </div>

                  <Separator className="my-3" />

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => onBookConsultation(therapist.id)}
                      className="flex-1"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Book Consultation
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onContactTherapist(therapist.id)}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewProfile(therapist.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      {shortlistedTherapists.length > 1 && (
        <Card className="border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                💡 Select therapists to compare side-by-side or contact multiple at once
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCompareTherapists(shortlistedTherapists.map(t => t.id))}
                disabled={shortlistedTherapists.length < 2}
              >
                <Compare className="h-3 w-3 mr-1" />
                Compare All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removal Confirmation Dialog */}
      <AlertDialog open={!!therapistToRemove} onOpenChange={() => setTherapistToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Shortlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this therapist from your shortlist? 
              You can always add them back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => therapistToRemove && confirmRemoval(therapistToRemove)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TherapistShortlist;