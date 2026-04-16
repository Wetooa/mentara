"use client";

import { useRouter } from "next/navigation";
import { usePreAssessmentControllerGetPreAssessment } from "api-client";
import ChatbotSnapshotForm from "@/components/pre-assessment/forms/ChatbotSnapshotForm";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientResultsPage() {
    const router = useRouter();
    
    const { data: assessment, isLoading, error, refetch } = usePreAssessmentControllerGetPreAssessment({
        query: {
            retry: false,
            staleTime: 0,
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-500 animate-pulse">Loading your results...</p>
            </div>
        );
    }

    if (error || !assessment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Results Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't retrieve your assessment results. Please ensure your assessment was completed.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => refetch()}>
                            Try Again
                        </Button>
                        <Button onClick={() => router.push("/client/assessment")}>
                            Start New Assessment
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-start justify-center py-12 px-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl overflow-hidden">
                <ChatbotSnapshotForm
                    data={assessment.data}
                    onContinue={() => router.push("/client/therapist")}
                />
            </div>
        </div>
    );
}
