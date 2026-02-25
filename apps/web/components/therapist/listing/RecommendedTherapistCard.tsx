"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Clock, DollarSign, Sparkles, CheckCircle2 } from "lucide-react";
import { RecommendedTherapistDto } from "api-client";
import { cn } from "@/lib/utils";

interface RecommendedTherapistCardProps {
  therapist: RecommendedTherapistDto;
  className?: string;
}

export default function RecommendedTherapistCard({
  therapist,
  className,
}: RecommendedTherapistCardProps) {
  const fullName = `${therapist.firstName} ${therapist.lastName}`;
  const initials = `${therapist.firstName[0]}${therapist.lastName[0]}`;
  
  return (
    <Card className={cn("group h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden", className)}>
      {/* Match Score Header */}
      <div className="bg-primary/5 px-6 py-2 flex items-center justify-start border-b">
        <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          AI Best Match
        </div>
      </div>

      <CardHeader className="pt-6 pb-2 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10 shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${therapist.id}`} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 overflow-hidden">
            <CardTitle className="text-xl font-bold truncate group-hover:text-primary transition-colors">
              {fullName}
            </CardTitle>
            <CardDescription className="text-sm font-medium flex items-center gap-1">
              Licensed Psychologist
            </CardDescription>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="h-4 w-4 fill-current" />
              {therapist.rating.toFixed(1)} 
              <span className="text-gray-400 font-normal ml-1">({therapist.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-2">
        {/* Match Reasons */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Why this match?</p>
          <div className="flex flex-wrap gap-1.5">
            {therapist.matchReasons?.slice(0, 3).map((reason, idx) => (
              <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 text-[10px] py-0.5 px-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {reason}
              </Badge>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-none">{therapist.yearsOfExperience}y</p>
              <p className="text-[10px] text-gray-400">Experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-none">₱{therapist.hourlyRate}</p>
              <p className="text-[10px] text-gray-400">per session</p>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Specializations</p>
          <div className="flex flex-wrap gap-1">
            {therapist.illnessSpecializations?.slice(0, 2).map((spec, idx) => (
              <span key={idx} className="text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {spec}
              </span>
            ))}
            {therapist.illnessSpecializations?.length > 2 && (
              <span className="text-[11px] font-medium text-gray-400 px-1 py-0.5">
                +{therapist.illnessSpecializations.length - 2} more
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Button className="w-full shadow-md group-hover:shadow-primary/20 transition-all font-bold gap-2">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
