import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, ClipboardList } from "lucide-react";

interface ModeSelectionFormProps {
  onSelectMode: (mode: "checklist" | "chatbot") => void;
}

export default function ModeSelectionForm({
  onSelectMode,
}: ModeSelectionFormProps) {
  return (
    <>
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
        <div className="w-full mb-6 text-center">
          <h4 className="text-lg text-center text-secondary mb-2">
            How would you like to complete your assessment?
          </h4>
          <p className="text-xs text-black/80">
            Choose the method that works best for you
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* AI Chatbot Option */}
          <button
            onClick={() => onSelectMode("chatbot")}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex flex-col items-start p-6 gap-4 bg-white hover:bg-primary/10 hover:border-primary/30 h-auto"
            )}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h5 className="font-semibold text-base">AI Chatbot</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Have a conversation with our AI assistant
                </p>
              </div>
            </div>
            <p className="text-xs text-black/60 text-left">
              Our AI will guide you through the assessment by asking questions
              in a natural conversation. You can answer in your own words, and
              the AI will help extract the information needed.
            </p>
          </button>

          {/* Traditional Checklist Option */}
          <button
            onClick={() => onSelectMode("checklist")}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex flex-col items-start p-6 gap-4 bg-white hover:bg-primary/10 hover:border-primary/30 h-auto"
            )}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h5 className="font-semibold text-base">
                  Traditional Checklist
                </h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill out questionnaires step by step
                </p>
              </div>
            </div>
            <p className="text-xs text-black/60 text-left">
              Complete the assessment using our structured questionnaire format.
              Select the areas you'd like to assess and answer questions one by
              one.
            </p>
          </button>
        </div>
      </div>
    </>
  );
}
