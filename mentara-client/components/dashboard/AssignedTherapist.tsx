"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Star, Loader2 } from "lucide-react";
import { useTherapist } from "@/hooks/useTherapist";

interface AssignedTherapistProps {
  onMessageTherapist?: () => void;
  onScheduleSession?: () => void;
}

export default function AssignedTherapist({
  onMessageTherapist,
  onScheduleSession,
}: AssignedTherapistProps) {
  const { therapist, loading, error } = useTherapist();

  if (loading) {
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
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
              <p className="text-sm text-red-500">{error}</p>
            </div>
            <Button variant="outline" size="sm">
              Try Again
            </Button>
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

  const fullName = `${therapist.firstName} ${therapist.lastName}`;
  const initials = `${therapist.firstName[0]}${therapist.lastName[0]}`;

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
              <AvatarImage src={therapist.profileImageUrl} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{fullName}</h3>
                {therapist.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {therapist.providerType} • {therapist.province}
              </p>
              {therapist.yearsOfExperience && (
                <p className="text-xs text-muted-foreground">
                  {therapist.yearsOfExperience} years experience
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          {therapist.patientSatisfaction && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">
                {therapist.patientSatisfaction.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({therapist.totalPatients} patients)
              </span>
            </div>
          )}

          {/* Specializations */}
          {therapist.illnessSpecializations.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Specializations</p>
              <div className="flex flex-wrap gap-1">
                {therapist.illnessSpecializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {therapist.illnessSpecializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{therapist.illnessSpecializations.length - 3} more
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
