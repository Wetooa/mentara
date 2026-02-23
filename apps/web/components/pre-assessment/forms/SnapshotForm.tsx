"use client";

import React, { useMemo } from "react";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Sparkles, ArrowRight, Activity, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAnonymousPreAssessment } from "@/hooks/pre-assessment/useAnonymousPreAssessment";
import { useCreatePreAssessment } from "@/hooks/pre-assessment/usePreAssessmentData";
import { calculateDetailedResults } from "@/lib/assessment-scoring";
import { useAuth } from "@/contexts/AuthContext";

export default function SnapshotForm() {
    const { isAuthenticated } = useAuth();
    const { mutateAsync: saveAssessment } = useCreatePreAssessment();
    const [hasSaved, setHasSaved] = React.useState(false);

    const { createAnonymous, isPending: isSubmitting } = useAnonymousPreAssessment();
    const { questionnaires, flatAnswers, nextStep, rapportAnswers } = usePreAssessmentChecklistStore();

    // Calculate scores and severity for the top 3 tools using centralized logic
    const insights = useMemo(() => {
        const seed = rapportAnswers.join(",");
        const results = calculateDetailedResults(questionnaires, flatAnswers, seed);

        return results.map(result => {
            // Map to visual severity (maintaining existing UI logic for colors/desc)
            let severityColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
            let description = "This area shows mild signs of disruption but appears manageable.";

            if (result.severity === "Significant" || result.severity === "Severe" || result.severity === "Likely") {
                severityColor = "bg-rose-50 text-rose-700 border-rose-100";
                description = "Your responses suggest this is a core area requiring clinical attention.";
            } else if (result.severity === "Moderate" || result.severity === "Mild") {
                severityColor = "bg-amber-50 text-amber-700 border-amber-100";
                description = "This factor is contributing notably to your current mental state.";
            }

            return {
                name: result.name,
                score: result.score,
                severity: result.severity, // Use the professional label from utility
                color: severityColor,
                description,
                percentage: result.percentage
            };
        });
    }, [questionnaires, flatAnswers, rapportAnswers]);

    // Auto-save for authenticated users
    React.useEffect(() => {
        if (isAuthenticated && !hasSaved && insights.length > 0) {
            const questionnaireScores: Record<string, { score: number; severity: string }> = {};
            insights.forEach(result => {
                questionnaireScores[result.name] = {
                    score: result.score,
                    severity: result.severity,
                };
            });

            saveAssessment({
                method: 'CHECKLIST',
                completedAt: new Date().toISOString(),
                data: { questionnaireScores },
                pastTherapyExperiences: null,
                medicationHistory: null,
                accessibilityNeeds: null,
                assessmentId: null,
            }).then(() => {
                setHasSaved(true);
            }).catch((err) => {
                console.error("Failed to auto-save pre-assessment", err);
            });
        }
    }, [isAuthenticated, hasSaved, insights, saveAssessment]);


    const handleSecureProfile = async () => {
        try {
            await createAnonymous();
            nextStep();
        } catch (error) {
            console.error("Failed to save anonymous assessment", error);
            toast.error("An error occurred while saving your assessment. Please try again.");
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 ring-8 ring-primary/5">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your Clinical Snapshot</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    We've analyzed your responses to create a focused profile for your care.
                </p>
            </div>

            <div className="grid gap-6 mt-4">
                {isAuthenticated ? (
                    <div className="space-y-4">
                        {insights.map((insight, idx) => {
                            const isHigh = insight.severity === 'Significant' || insight.severity === 'Severe' || insight.severity === 'Likely';
                            const barColor = isHigh ? 'bg-rose-500' : 'bg-amber-500';
                            return (
                                <Card key={idx} className="border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
                                    <CardHeader className={`pb-3 ${insight.color} bg-opacity-20 border-b border-opacity-10`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{insight.name}</CardTitle>
                                            <Badge variant="outline" className={`${insight.color} font-bold px-3 py-1 shadow-sm whitespace-nowrap self-start sm:self-auto`}>
                                                {insight.severity}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 border-t border-gray-50 bg-white">
                                        <p className="text-sm text-gray-600 font-medium mb-4 leading-relaxed">
                                            {insight.description}
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <span>Impact Level</span>
                                                <span className={isHigh ? "text-rose-600" : "text-amber-600"}>{Math.round(insight.percentage)}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} 
                                                    style={{ width: `${insight.percentage}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        <Card className="border-primary/20 bg-white shadow-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                                <div className="p-4 rounded-full bg-primary/10 mb-4">
                                    <Lock className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Results Locked</h3>
                                <p className="text-sm text-gray-600 max-w-xs">
                                    Please secure your profile to view your clinical snapshot and therapist recommendations.
                                </p>
                            </div>

                            {/* Blurred fake content to look like results */}
                            <CardHeader className="pb-2 opacity-50 blur-sm pointer-events-none filter select-none">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-gray-400" />
                                        <CardTitle className="text-lg text-gray-400">Primary Focus</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="bg-gray-100 text-gray-400 border-gray-200">
                                        Significant Impact
                                    </Badge>
                                </div>
                                <CardDescription className="text-gray-300 font-medium text-base mt-1 bg-gray-200 h-6 w-1/3 rounded">
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="opacity-50 blur-sm pointer-events-none filter select-none">
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
                                        <div className="h-full bg-gray-300 w-3/4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator className="my-2" />

                        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 flex gap-3 items-start">
                            <Heart className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-amber-900">Why this matters</h4>
                                <p className="text-xs text-amber-800/80 leading-relaxed">
                                    This snapshot helps us match you with a therapist who specializes in exactly what you're facing. You won't have to explain the basics from scratch.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!isAuthenticated && (
                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        size="lg"
                        className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                        onClick={handleSecureProfile}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Securing Profile...
                            </>
                        ) : (
                            <>
                                Secure Your Profile
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                    <p className="text-[11px] text-center text-gray-400 px-8">
                        By continuing, your assessment results will be securely saved to your new account.
                    </p>
                </div>
            )}
        </div>
    );
}
