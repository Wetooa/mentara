"use client";

import React from "react";
import {
    FileText,
    ClipboardList,
    Bug,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SessionInsightsProps {
    assessmentComplete: boolean;
    messagesCount: number;
    sessionId: string | null;
    showDebug: boolean;
}

export const SessionInsights = ({
    assessmentComplete,
    messagesCount,
    sessionId,
    showDebug
}: SessionInsightsProps) => {
    return (
        <aside className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Session Insights</h2>
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">LIVE</Badge>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Summary Card */}
                    <Card className="border-dashed bg-gray-50/40 shadow-none">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                Clinical Summary
                            </CardTitle>
                            <CardDescription className="text-[10px]">
                                {assessmentComplete ? "Summary Generated" : "Will appear when ready"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {assessmentComplete ? (
                                <div className="space-y-3">
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        Your preliminary clinical snapshot has been generated based on the concerns you shared regarding your emotional wellbeing.
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full text-[11px] h-8 gap-2">
                                        View Full Snapshot
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-24 rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground italic text-[11px] p-4 text-center">
                                    <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                                    Rapport building in progress...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Separator className="opacity-50" />

                    {/* Detected Scales */}
                    <div className="space-y-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
                            <ClipboardList className="h-3.5 w-3.5" />
                            Detected Questionnaires
                        </h3>
                        <div className="space-y-2">
                            {assessmentComplete ? (
                                <div className="space-y-1.5">
                                    {["PHQ-9", "GAD-7", "Clinical Interview"].map(scale => (
                                        <div key={scale} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            <span className="text-[11px] font-medium">{scale}</span>
                                            <Badge className="bg-emerald-500 text-[9px] h-4">COMPLETE</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100/50 animate-pulse">
                                        <div className="h-3 w-20 bg-gray-200 rounded" />
                                        <div className="h-3 w-8 bg-gray-200 rounded" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center italic">AURIS is listening for clinical triggers...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Debug View */}
                    {showDebug && (
                        <div className="mt-8 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-[11px] font-bold text-amber-500 uppercase flex items-center gap-2">
                                <Bug className="h-3.5 w-3.5" />
                                Debug State
                            </h3>
                            <pre className="text-[9px] p-3 rounded-lg bg-gray-900 text-emerald-400 overflow-x-auto border-l-2 border-amber-500">
                                {JSON.stringify({ sessionId, messagesCount, isComplete: assessmentComplete }, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Actions Footer */}
            <div className="p-4 border-t bg-gray-50/50 space-y-2">
                <Button disabled={!assessmentComplete} className="w-full text-xs h-9 justify-between shadow-sm">
                    Download SOAP Note
                    <Download className="h-3.5 w-3.5" />
                </Button>
                <p className="text-[9px] text-center text-muted-foreground">
                    {assessmentComplete ? "Ready for download" : "Available after Snapshot phase"}
                </p>
            </div>
        </aside>
    );
};
