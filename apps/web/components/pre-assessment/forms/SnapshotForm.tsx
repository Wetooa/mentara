"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Heart, Sparkles, ArrowRight, Activity, TrendingUp } from "lucide-react";
import { QUESTIONNAIRE_MAP } from "@/constants/questionnaire/questionnaire-mapping";

export default function SnapshotForm() {
    const { questionnaires, flatAnswers, nextStep } = usePreAssessmentChecklistStore();

    // Calculate scores and severity for the top 3 tools
    const insights = useMemo(() => {
        const results = [];
        let answerOffset = 0;

        for (const qName of questionnaires) {
            const qConfig = QUESTIONNAIRE_MAP[qName];
            const qCount = qConfig.questions.length;
            const qAnswers = flatAnswers.slice(answerOffset, answerOffset + qCount);

            // Determine max option value for this specific tool (3 or 4 usually)
            const optionsCount = qConfig.questions[0]?.options?.length || 4;
            const maxPerQuestion = optionsCount - 1;

            const score = qAnswers.reduce((sum, val) => sum + (val === -1 ? 0 : val), 0);
            const maxPossible = qCount * maxPerQuestion;
            const percentage = maxPossible > 0 ? (score / maxPossible) * 100 : 0;

            // Map to visual severity
            let severityLabel = "Low Impact";
            let severityColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
            let description = "This area shows mild signs of disruption but appears manageable.";

            if (percentage > 75) {
                severityLabel = "Significant Impact";
                severityColor = "bg-rose-50 text-rose-700 border-rose-100";
                description = "Your responses suggest this is a core area requiring clinical attention.";
            } else if (percentage > 35) {
                severityLabel = "Moderate Impact";
                severityColor = "bg-amber-50 text-amber-700 border-amber-100";
                description = "This factor is contributing notably to your current mental state.";
            }

            results.push({
                name: qName,
                score,
                severity: severityLabel,
                color: severityColor,
                description,
                percentage
            });

            answerOffset += qCount;
        }
        return results;
    }, [questionnaires, flatAnswers]);

    const primaryConcern = insights[0];
    const secondaryConcerns = insights.slice(1);

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
                {/* Primary Insight */}
                {primaryConcern && (
                    <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Primary Focus</CardTitle>
                                </div>
                                <Badge variant="outline" className={primaryConcern.color}>
                                    {primaryConcern.severity} Impact
                                </Badge>
                            </div>
                            <CardDescription className="text-primary/80 font-medium text-base mt-1">
                                {primaryConcern.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Your responses indicate that <span className="font-semibold text-gray-900">{primaryConcern.name}</span> is currently the most significant area affecting your well-being.
                                </p>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(15, primaryConcern.percentage)}%` }}
                                        className="h-full bg-primary"
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Secondary Insights */}
                {secondaryConcerns.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {secondaryConcerns.map((insight, idx) => (
                            <Card key={idx} className="border-gray-200 shadow-sm bg-white">
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Secondary Area</span>
                                        <Badge variant="outline" className={`text-[10px] h-5 ${insight.color}`}>
                                            {insight.severity}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-sm font-bold text-gray-800">{insight.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        Contributing factor in your overall mental health profile.
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

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
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    onClick={nextStep}
                >
                    Secure Your Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-[11px] text-center text-gray-400 px-8">
                    By continuing, your assessment results will be securely saved to your new account.
                </p>
            </div>
        </div>
    );
}
