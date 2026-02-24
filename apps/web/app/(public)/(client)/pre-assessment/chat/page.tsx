"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import ChatbotInterface from "@/components/pre-assessment/ChatbotInterface";

function ChatbotPageContent() {
    const router = useRouter();

    return (
        <div className="h-screen w-full bg-[#F8FAFC]">
            <ChatbotInterface
                onComplete={() => router.push("/pre-assessment/welcome")}
                onCancel={() => router.push("/pre-assessment")}
                hideHeader={false}
            />
        </div>
    );
}

export default function ChatbotPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-gray-600">Initializing AURIS...</div>
            </div>
        }>
            <ChatbotPageContent />
        </Suspense>
    );
}
