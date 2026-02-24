import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardList, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";

interface ModeSelectionFormProps {
  onSelectMode: (mode: 'checklist' | 'chatbot') => void;
}

export default function ModeSelectionForm({
  onSelectMode,
}: ModeSelectionFormProps) {
  return (
    <div className="w-full p-6 sm:p-8 space-y-10">
      <motion.div 
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="w-full text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h4 className="text-3xl font-bold text-gray-900">
            How would you like to get started?
          </h4>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the assessment method that feels most comfortable for you. 
          Both options will help us understand your needs and match you with the right therapist.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch" role="group" aria-label="Assessment method selection">
        {/* Traditional Checklist Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode('checklist')}
          className={cn(
            "group flex flex-col items-stretch p-0 bg-white/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary rounded-3xl transition-all duration-300 shadow-sm hover:shadow-2xl text-left relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary/30"
          )}
          aria-label="Select traditional checklist assessment method"
        >
          <div className="absolute top-0 right-0 p-4">
            <Badge className="bg-primary text-white">Quick & Easy</Badge>
          </div>
          
          <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors" aria-hidden="true">
              <ClipboardList className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-2 flex-1">
              <h5 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">Traditional Checklist</h5>
              <p className="text-gray-600 leading-relaxed">
                Complete a structured questionnaire with checklists and forms. 
                This traditional method provides a comprehensive clinical assessment.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Step-by-step format
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Immediate clinical insights
              </li>
            </ul>

            <Button
              className="w-full h-12 rounded-xl group-hover:bg-primary/90 transition-all pointer-events-none"
              size="lg"
            >
              Start Checklist
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.button>

        {/* Chatbot Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode('chatbot')}
          className={cn(
            "group flex flex-col items-stretch p-0 bg-white/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary rounded-3xl transition-all duration-300 shadow-sm hover:shadow-2xl text-left relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary/30"
          )}
          aria-label="Select AI chatbot assessment method"
        >
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">Recommended</Badge>
          </div>

          <div className="p-8 space-y-6 flex-1 flex flex-col">
            <div className="p-4 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors" aria-hidden="true">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-2 flex-1">
              <h5 className="font-bold text-2xl text-gray-900">AI Chatbot Assessment</h5>
              <p className="text-gray-600 leading-relaxed">
                Have a natural conversation with AURIS, our AI assistant. 
                Answer questions naturally and deeply share your thoughts.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Natural conversation flow
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Personalized experience
              </li>
            </ul>

            <Button
              className="w-full h-12 rounded-xl group-hover:bg-primary/90 transition-all pointer-events-none"
              size="lg"
            >
              Start Chat Assessment
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

