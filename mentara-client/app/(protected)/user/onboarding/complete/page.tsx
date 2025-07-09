"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useApi } from "@/lib/api";
import { 
  CheckCircle, 
  User, 
  Target, 
  Users, 
  Calendar,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";

interface OnboardingData {
  profile: any;
  goals: any;
  preferences: any;
}

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { toast } = useToast();
  const api = useApi();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load onboarding data from localStorage
    const profileData = localStorage.getItem("onboarding_profile");
    const goalsData = localStorage.getItem("onboarding_goals");
    const preferencesData = localStorage.getItem("onboarding_preferences");

    if (profileData && goalsData && preferencesData) {
      setOnboardingData({
        profile: JSON.parse(profileData),
        goals: JSON.parse(goalsData),
        preferences: JSON.parse(preferencesData),
      });
    }
  }, []);

  const handleCompleteOnboarding = async () => {
    if (!onboardingData) return;
    
    setIsSubmitting(true);
    try {
      // Submit all onboarding data to backend API
      const response = await api.client.completeOnboarding(onboardingData);
      
      if (response.success) {
        // Clear localStorage
        localStorage.removeItem("onboarding_profile");
        localStorage.removeItem("onboarding_goals");
        localStorage.removeItem("onboarding_preferences");
        
        // Mark onboarding as complete
        localStorage.setItem("onboarding_completed", "true");
        
        toast({
          title: "Welcome to Mentara!",
          description: "Your profile is complete. Let's find you the perfect therapist.",
        });
        
        // Redirect to welcome page with therapist recommendations
        router.push("/user/welcome");
      } else {
        throw new Error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low": return "bg-green-100 text-green-800";
      case "moderate": return "bg-blue-100 text-blue-800";
      case "high": return "bg-yellow-100 text-yellow-800";
      case "crisis": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatGoalLabels = (goals: string[]) => {
    const goalLabels: Record<string, string> = {
      "anxiety": "Anxiety",
      "depression": "Depression",
      "relationships": "Relationships",
      "stress": "Stress",
      "sleep": "Sleep",
      "self-esteem": "Self-Esteem",
      "substance": "Substance Use",
      "trauma": "Trauma",
      "grief": "Grief & Loss",
      "life-transitions": "Life Transitions",
      "work-stress": "Work Stress",
      "family-issues": "Family Issues",
    };
    
    return goals.map(goal => goalLabels[goal] || goal);
  };

  if (!onboardingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Loading your profile...</div>
          <Button onClick={() => router.push("/user/onboarding/profile")}>
            Start Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Mentara! 🎉
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your profile is complete! We're ready to help you find the perfect therapist 
          and begin your mental health journey.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">
                {onboardingData.profile.firstName} {onboardingData.profile.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {onboardingData.profile.gender} • {onboardingData.profile.city}, {onboardingData.profile.state}
              </div>
            </div>
            <div className="text-sm">
              <div className="text-gray-600">Emergency Contact:</div>
              <div className="font-medium">{onboardingData.profile.emergencyContactName}</div>
              <div className="text-gray-600">{onboardingData.profile.emergencyContactRelationship}</div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge className={`${getUrgencyColor(onboardingData.goals.urgencyLevel)} mb-2`}>
                {onboardingData.goals.urgencyLevel.charAt(0).toUpperCase() + 
                 onboardingData.goals.urgencyLevel.slice(1)} Priority
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Focus Areas:</div>
              <div className="flex flex-wrap gap-1">
                {formatGoalLabels(onboardingData.goals.treatmentGoals).map((goal, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Therapist Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Gender:</span> {
                  onboardingData.preferences.genderPreference === "no-preference" 
                    ? "No preference" 
                    : onboardingData.preferences.genderPreference
                }
              </div>
              <div>
                <span className="font-medium">Format:</span> {
                  onboardingData.preferences.sessionFormat === "no-preference"
                    ? "No preference"
                    : onboardingData.preferences.sessionFormat
                }
              </div>
              <div>
                <span className="font-medium">Frequency:</span> {onboardingData.preferences.sessionFrequency}
              </div>
              <div>
                <span className="font-medium">Budget:</span> {
                  onboardingData.preferences.budgetRange === "insurance"
                    ? "Insurance coverage"
                    : onboardingData.preferences.budgetRange
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            What's Next?
          </CardTitle>
          <CardDescription>
            Here's what happens after you complete your onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">1. Find Your Therapist</div>
                <div className="text-sm text-gray-600">
                  Browse therapists that match your preferences and goals
                </div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-medium">2. Schedule Your First Session</div>
                <div className="text-sm text-gray-600">
                  Book a convenient time for your initial consultation
                </div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">3. Begin Your Journey</div>
                <div className="text-sm text-gray-600">
                  Start working towards your mental health goals
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => router.push("/user/onboarding/therapist-preferences")}
        >
          Back to Preferences
        </Button>
        <Button 
          onClick={handleCompleteOnboarding}
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            "Completing Setup..."
          ) : (
            <>
              Find My Therapist
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Privacy Notice */}
      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto border-t pt-6">
        <p>
          Your information is secure and private. We use this data only to match you with 
          appropriate therapists and provide better care. You can update your preferences 
          at any time in your profile settings.
        </p>
      </div>
    </div>
  );
}