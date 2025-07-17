'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Compare,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Video,
  Phone,
  Users,
  Award,
  Heart,
  CheckCircle,
  X,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio: string;
  specialties: string[];
  approaches: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  location: string;
  sessionFormats: string[];
  languages: string[];
  availability: string[];
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  insurance: string[];
  credentials: string[];
  matchingScore?: number;
  isAvailable: boolean;
  nextAvailableSlot?: string;
}

interface TherapistComparisonModalProps {
  therapists: Therapist[];
  children?: React.ReactNode;
  onSelectTherapist?: (therapistId: string) => void;
  onContactTherapist?: (therapistId: string) => void;
  maxComparisons?: number;
  className?: string;
}

const comparisonCategories = [
  {
    id: 'overview',
    name: 'Overview',
    icon: Users,
    fields: ['rating', 'experience', 'totalReviews', 'matchingScore']
  },
  {
    id: 'specialties',
    name: 'Specialties & Approaches',
    icon: Heart,
    fields: ['specialties', 'approaches']
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: Calendar,
    fields: ['location', 'sessionFormats', 'availability', 'languages']
  },
  {
    id: 'pricing',
    name: 'Pricing & Insurance',
    icon: DollarSign,
    fields: ['pricing', 'insurance']
  },
  {
    id: 'credentials',
    name: 'Credentials',
    icon: Award,
    fields: ['credentials']
  }
];

export function TherapistComparisonModal({
  therapists,
  children,
  onSelectTherapist,
  onContactTherapist,
  maxComparisons = 3,
  className
}: TherapistComparisonModalProps) {
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('overview');

  const limitedTherapists = therapists.slice(0, maxComparisons);
  const comparisonTherapists = limitedTherapists.filter(t => 
    selectedTherapists.length === 0 || selectedTherapists.includes(t.id)
  );

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getMatchingScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-50';
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const renderFieldValue = (therapist: Therapist, field: string) => {
    switch (field) {
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="font-medium">{therapist.rating.toFixed(1)}</span>
          </div>
        );
      
      case 'experience':
        return (
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-primary" />
            <span>{therapist.experience} years</span>
          </div>
        );
      
      case 'totalReviews':
        return (
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span>{therapist.totalReviews} reviews</span>
          </div>
        );
      
      case 'matchingScore':
        return therapist.matchingScore ? (
          <Badge className={cn('text-xs', getMatchingScoreColor(therapist.matchingScore))}>
            {therapist.matchingScore}% match
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No score</span>
        );
      
      case 'specialties':
        return (
          <div className="space-y-1">
            {therapist.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {therapist.specialties.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{therapist.specialties.length - 3} more
              </span>
            )}
          </div>
        );
      
      case 'approaches':
        return (
          <div className="space-y-1">
            {therapist.approaches.slice(0, 2).map((approach, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {approach}
              </Badge>
            ))}
            {therapist.approaches.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{therapist.approaches.length - 2} more
              </span>
            )}
          </div>
        );
      
      case 'location':
        return (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{therapist.location}</span>
          </div>
        );
      
      case 'sessionFormats':
        return (
          <div className="flex gap-1">
            {therapist.sessionFormats.includes('video') && (
              <Video className="h-4 w-4 text-primary" />
            )}
            {therapist.sessionFormats.includes('phone') && (
              <Phone className="h-4 w-4 text-primary" />
            )}
            {therapist.sessionFormats.includes('in-person') && (
              <Users className="h-4 w-4 text-primary" />
            )}
          </div>
        );
      
      case 'availability':
        return (
          <div className="space-y-1">
            {therapist.availability.slice(0, 2).map((slot, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                {slot}
              </div>
            ))}
            {therapist.nextAvailableSlot && (
              <div className="text-xs text-green-600 font-medium">
                Next: {therapist.nextAvailableSlot}
              </div>
            )}
          </div>
        );
      
      case 'languages':
        return (
          <div className="space-y-1">
            {therapist.languages.map((language, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        );
      
      case 'pricing':
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {formatCurrency(therapist.pricing.min)} - {formatCurrency(therapist.pricing.max)}
            </div>
            <div className="text-xs text-muted-foreground">per session</div>
          </div>
        );
      
      case 'insurance':
        return (
          <div className="space-y-1">
            {therapist.insurance.slice(0, 3).map((ins, index) => (
              <div key={index} className="text-xs text-green-600">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                {ins}
              </div>
            ))}
            {therapist.insurance.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{therapist.insurance.length - 3} more plans
              </span>
            )}
          </div>
        );
      
      case 'credentials':
        return (
          <div className="space-y-1">
            {therapist.credentials.map((credential, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {credential}
              </Badge>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className={className}>
        {children || (
          <Button variant="outline" className="gap-2">
            <Compare className="h-4 w-4" />
            Compare Therapists
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Compare className="h-5 w-5" />
            Compare Therapists
          </DialogTitle>
          <DialogDescription>
            Side-by-side comparison to help you choose the right therapist for your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="flex border-b border-border">
            {/* Category Navigation */}
            <div className="w-48 border-r border-border">
              <ScrollArea className="h-[60vh]">
                <div className="p-4 space-y-1">
                  {comparisonCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                          activeCategory === category.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Therapist Comparison Grid */}
            <div className="flex-1">
              <ScrollArea className="h-[60vh]">
                <div className="p-4">
                  {comparisonTherapists.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No therapists selected for comparison
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {comparisonTherapists.map((therapist) => (
                        <Card key={therapist.id} className="h-fit">
                          {/* Therapist Header */}
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={therapist.profileImage} />
                                <AvatarFallback>
                                  {therapist.firstName[0]}{therapist.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">
                                  {therapist.firstName} {therapist.lastName}
                                </h3>
                                <div className="flex items-center gap-1 mt-1">
                                  {therapist.isAvailable ? (
                                    <>
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      <span className="text-xs text-green-600">Available</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                      <span className="text-xs text-yellow-600">Limited</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0 space-y-4">
                            {/* Category Fields */}
                            {comparisonCategories
                              .find(cat => cat.id === activeCategory)
                              ?.fields.map((field) => (
                                <div key={field} className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                  <div className="min-h-[24px]">
                                    {renderFieldValue(therapist, field)}
                                  </div>
                                </div>
                              ))}

                            {/* Action Buttons */}
                            <Separator />
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => onSelectTherapist?.(therapist.id)}
                              >
                                Select Therapist
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => onContactTherapist?.(therapist.id)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Comparing {comparisonTherapists.length} therapists</span>
            <span>Data updated in real-time</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TherapistComparisonModal;