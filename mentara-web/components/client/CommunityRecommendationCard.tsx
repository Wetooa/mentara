"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Heart,
  CheckCircle,
  Info,
  Star,
  TrendingUp,
} from "lucide-react";
import { CommunityRecommendation } from "@/lib/api/services/communities";

interface CommunityRecommendationCardProps {
  community: CommunityRecommendation;
  rank: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  disabled?: boolean;
  showMatchExplanation?: boolean;
}

export function CommunityRecommendationCard({
  community,
  rank,
  isSelected,
  onSelect,
  disabled = false,
  showMatchExplanation = true,
}: CommunityRecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 0.8)
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg";
    if (score >= 0.6)
      return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg";
    if (score >= 0.4)
      return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg";
    return "bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Excellent Match";
    if (score >= 0.6) return "Good Match";
    if (score >= 0.4) return "Fair Match";
    return "Possible Match";
  };

  console.log("community", community);

  return (
    <Card
      className={`transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isSelected
          ? "ring-2 ring-emerald-400 shadow-2xl bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/30 scale-[1.02]"
          : "hover:shadow-xl hover:scale-[1.01] hover:bg-gradient-to-br hover:from-gray-50/80 hover:via-white hover:to-emerald-50/20"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  disabled={disabled}
                  className="scale-110 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-blue-500 border-2"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <Badge className="relative bg-gradient-to-br from-emerald-500 to-blue-600 text-white px-3 py-1 font-bold shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  #{rank}
                </Badge>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {community.name}
                </h3>
              </div>

              <p className="text-gray-600 font-medium text-sm mb-3 leading-relaxed">
                {community.description}
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-lg border border-emerald-100 shadow-sm">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {community.memberCount} members
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-lg border border-blue-100 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {getScoreLabel(community.compatibilityScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 p-2 rounded-lg"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {showMatchExplanation && (
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/50 border border-emerald-200/60 rounded-xl p-5 mb-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-emerald-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 mb-2">
                  Why this community?
                </p>
                <p className="text-sm text-emerald-700 font-medium leading-relaxed p-3 bg-white/60 rounded-lg border border-emerald-100/50">
                  {community.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/70 rounded-lg border border-emerald-100">
                <span className="font-bold text-gray-900 text-sm">
                  Community Type:
                </span>
                <p className="text-emerald-600 font-medium text-sm">
                  Support Group
                </p>
              </div>
              <div className="p-3 bg-white/70 rounded-lg border border-blue-100">
                <span className="font-bold text-gray-900 text-sm">
                  Activity Level:
                </span>
                <p className="text-blue-600 font-medium text-sm">
                  {community.memberCount > 100
                    ? "Very Active"
                    : community.memberCount > 50
                      ? "Active"
                      : "Growing"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="text-sm text-rose-700 font-medium">
                Join a supportive community of people who understand your
                experience
              </span>
            </div>
          </div>
        )}

        {isSelected && (
          <div className="mt-4 flex items-center gap-3 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-3 shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-bold">Selected for joining</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
