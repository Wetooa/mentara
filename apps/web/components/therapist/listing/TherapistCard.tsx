"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Clock, DollarSign, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface TherapistCardProps {
  therapist: any; // Using any to handle the generated API DTOs which might vary
  className?: string;
}

export default function TherapistCard({
  therapist,
  className,
}: TherapistCardProps) {
  const firstName = therapist.user?.firstName || therapist.firstName || "";
  const lastName = therapist.user?.lastName || therapist.lastName || "";
  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`;
  
  return (
    <Card className={cn("group h-full flex flex-col hover:shadow-md transition-all duration-200 border border-gray-200", className)}>
      <CardContent className="pt-6 pb-2 flex-1 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border shadow-sm shrink-0">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${therapist.id || therapist.userId}`} alt={fullName} />
            <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
              {fullName}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {therapist.professionalLicenseType || "Licensed Professional"}
            </p>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="h-3.5 w-3.5 fill-current" />
              {(therapist.rating || 5).toFixed(1)} 
              <span className="text-gray-400 font-normal ml-1">({therapist.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Specializations Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(therapist.expertise || therapist.illnessSpecializations || []).slice(0, 3).map((spec: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px] px-2 py-0">
              {spec}
            </Badge>
          ))}
          {(therapist.expertise?.length > 3) && (
            <span className="text-[10px] text-gray-400 font-medium">+{(therapist.expertise || therapist.illnessSpecializations).length - 3}</span>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>{therapist.yearsOfExperience || 0}y Experience</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            <span>₱{therapist.hourlyRate || 1500}/session</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 col-span-2">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span className="truncate">{therapist.province || "Mental Health Professional"}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6 border-t mt-auto">
        <Button variant="outline" className="w-full font-bold">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
