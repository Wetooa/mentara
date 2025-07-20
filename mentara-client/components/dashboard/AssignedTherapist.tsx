"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar } from "lucide-react";

interface Therapist {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  specializations?: string[];
  hourlyRate?: number;
  status: string;
}

interface AssignedTherapistProps {
  assignedTherapists?: Therapist[];
  isLoading?: boolean;
  onMessageTherapist?: () => void;
  onScheduleSession?: () => void;
}

export default function AssignedTherapist({
  assignedTherapists = [],
  isLoading = false,
  onMessageTherapist,
  onScheduleSession,
}: AssignedTherapistProps) {
  // Get the primary therapist (first one if multiple)
  const therapist = assignedTherapists.length > 0 ? assignedTherapists[0] : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Therapist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!therapist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Therapist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No therapist assigned yet</p>
            </div>
            <Button variant="outline" size="sm">
              Find a Therapist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstName = therapist.user.firstName || '';
  const lastName = therapist.user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Therapist';
  const initials = `${firstName[0] || 'T'}${lastName[0] || 'H'}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Your Therapist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Therapist Info */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={therapist.user.imageUrl} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{fullName}</h3>
                {therapist.status === 'approved' && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Licensed Therapist
              </p>
              {therapist.hourlyRate && (
                <p className="text-xs text-muted-foreground">
                  ${therapist.hourlyRate}/hour
                </p>
              )}
            </div>
          </div>

          {/* Specializations */}
          {therapist.specializations && therapist.specializations.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Specializations</p>
              <div className="flex flex-wrap gap-1">
                {therapist.specializations.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {therapist.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{therapist.specializations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1" onClick={onMessageTherapist}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onScheduleSession}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
