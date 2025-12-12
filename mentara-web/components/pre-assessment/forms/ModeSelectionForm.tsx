import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardList, MessageSquare } from "lucide-react";

interface ModeSelectionFormProps {
  onSelectMode: (mode: 'checklist' | 'chatbot') => void;
}

export default function ModeSelectionForm({
  onSelectMode,
}: ModeSelectionFormProps) {
  return (
    <div className="w-full p-6 sm:p-8">
      <div className="w-full mb-10 text-center">
        <h4 className="text-3xl font-bold text-gray-900 mb-3">
          Get Started with Your Assessment
        </h4>
        <p className="text-base text-gray-600 max-w-md mx-auto">
          Complete the assessment using our structured questionnaire format
        </p>
      </div>

      <div className="flex flex-col gap-6" role="group" aria-label="Assessment method selection">
        {/* Chatbot Option */}
        <button
          onClick={() => onSelectMode('chatbot')}
          className={cn(
            "group flex flex-col items-start p-6 sm:p-8 gap-4 bg-white hover:bg-primary/5 border-2 border-gray-200 hover:border-primary rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left w-full min-h-[44px] touch-manipulation focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
          )}
          aria-label="Select AI chatbot assessment method"
        >
          <div className="flex items-start gap-4 w-full">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors flex-shrink-0" aria-hidden="true">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xl text-gray-900 mb-2">AI Chatbot Assessment</h5>
              <p className="text-sm text-gray-600 mb-3">
                Have a natural conversation with our AI assistant
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Engage in a personalized conversation where our AI will guide you through the assessment. 
                Share your thoughts naturally, and we'll help identify areas where you might benefit from support.
              </p>
            </div>
          </div>
        </button>

        {/* Traditional Checklist Option */}
        <button
          onClick={() => onSelectMode('checklist')}
          className={cn(
            "group flex flex-col items-start p-6 sm:p-8 gap-4 bg-white hover:bg-primary/5 border-2 border-gray-200 hover:border-primary rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left w-full min-h-[44px] touch-manipulation focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
          )}
          aria-label="Select traditional checklist assessment method"
        >
          <div className="flex items-start gap-4 w-full">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors flex-shrink-0" aria-hidden="true">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xl text-gray-900 mb-2">Traditional Checklist</h5>
              <p className="text-sm text-gray-600 mb-3">
                Fill out questionnaires step by step
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Complete the assessment using our structured questionnaire format. 
                Select the areas you'd like to assess and answer questions one by one.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

