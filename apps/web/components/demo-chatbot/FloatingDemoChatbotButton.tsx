"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { DemoChatbotModal } from "./DemoChatbotModal";

export function FloatingDemoChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ scale: isOpen ? 0.9 : 1 }}
        className="fixed bottom-8 right-8 z-40"
        data-demo-chatbot-button
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
          aria-label={isOpen ? "Close demo chatbot" : "Open demo chatbot"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </motion.div>

      <DemoChatbotModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
