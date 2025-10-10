"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Construction } from "lucide-react";

export default function RecommendationsPage() {
  const router = useRouter();

  const handleComplete = () => {
    // For now, redirect to client dashboard (will be updated once renamed)
    router.push("/client");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full">
            <Construction className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            Personalized recommendations are being redesigned to provide better matches.
          </p>
          <p className="text-sm text-gray-500">
            Community and therapist matching will be integrated into role-specific dashboards.
          </p>
          <Button onClick={handleComplete} className="w-full">
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}