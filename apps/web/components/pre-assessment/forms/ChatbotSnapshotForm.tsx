"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    ArrowRight,
    Brain,
    ShieldCheck,
    AlertTriangle,
    Activity,
} from "lucide-react";
import type { PreAssessmentData } from "api-client";

interface ChatbotSnapshotFormProps {
    data: PreAssessmentData | null;
    onContinue: () => void;
}

const QUESTIONNAIRE_MAP: Record<string, string> = {
    GAD7: 'Anxiety',
    PHQ9: 'Depression',
    ISI: 'Insomnia',
    ASRS: 'ADHD',
    AUDIT: 'Alcohol Use',
    DAST10: 'Substance Use',
    "PCL-5": 'PTSD',
    MDQ: 'Bipolar Disorder',
    EDEQ: 'Eating Disorders',
    adhd: 'ADHD',
    alcohol: 'Alcohol Use',
    'binge-eating': 'Eating Disorders',
    burnout: 'Burnout',
    'drug-abuse': 'Substance Use',
    anxiety: 'Anxiety',
    insomnia: 'Insomnia',
    'mood-disorder': 'Bipolar Disorder',
    'obsessional-compulsive': 'OCD',
    'panic-disorder': 'Panic',
    stress: 'Stress',
    phobia: 'Phobia',
    depression: 'Depression',
    ptsd: 'PTSD',
    'social-phobia': 'Social Anxiety',
};

function severityDisplay(severity: string | undefined): {
    label: string;
    cardColor: string;
    badgeColor: string;
    icon: React.ReactNode;
} {
    const s = (severity ?? "").toLowerCase();

    if (s.includes("severe") || s.includes("high") || s.includes("significant")) {
        return {
            label: severity!,
            cardColor: "bg-rose-50 border-rose-100",
            badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
            icon: <AlertTriangle className="h-4 w-4 text-rose-500" />,
        };
    }
    if (s.includes("moderate")) {
        return {
            label: severity!,
            cardColor: "bg-amber-50 border-amber-100",
            badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
            icon: <Activity className="h-4 w-4 text-amber-500" />,
        };
    }
    if (s.includes("mild") || s.includes("low")) {
        return {
            label: severity!,
            cardColor: "bg-emerald-50 border-emerald-100",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
        };
    }
    return {
        label: severity ?? "Below Threshold",
        cardColor: "bg-slate-50 border-slate-200",
        badgeColor: "bg-slate-50 text-slate-600 border-slate-200",
        icon: <ShieldCheck className="h-4 w-4 text-slate-400" />,
    };
}

export default function ChatbotSnapshotForm({ data, onContinue }: ChatbotSnapshotFormProps) {
    const scores = data?.questionnaireScores ?? {};
    const scoreEntries = Object.entries(scores);
    const hasData = scoreEntries.length > 0;

    return (
        <div className="flex flex-col gap-6 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10 ring-8 ring-primary/5">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Your Clinical Snapshot
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    AURIS has identified the following areas based on your assessment scores.
                </p>
            </div>

            {hasData ? (
                <div className="grid gap-6 mt-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Identified Focus Areas
                            </h3>
                        </div>

                        {scoreEntries.map(([key, scoreData], idx) => {
                            const condition = QUESTIONNAIRE_MAP[key] || key;
                            const meta = severityDisplay(scoreData.severity);
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                >
                                    <Card className={`border shadow-sm overflow-hidden rounded-2xl ${meta.cardColor}`}>
                                        <CardHeader className="py-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <CardTitle className="text-base font-bold text-gray-900 leading-tight flex items-center gap-2">
                                                    {meta.icon}
                                                    {key !== condition ? `${key} (${condition})` : key}
                                                </CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className={`${meta.badgeColor} font-semibold px-3 py-1 self-start sm:self-auto`}
                                                >
                                                    {meta.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No clinical focus areas identified yet. Your therapist will review your session notes.
                </div>
            )}

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-3 mt-2"
            >
                <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    onClick={onContinue}
                >
                    Find My Therapist
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-[11px] text-center text-gray-400 px-8">
                    Your snapshot is shared only with therapists you choose to match with.
                </p>
            </motion.div>
        </div>
    );
}
