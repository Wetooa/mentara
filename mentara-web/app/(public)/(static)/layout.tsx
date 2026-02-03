import Navbar from "@/components/navbar/static-navbar/navbar";
import React from "react";
import { FloatingDemoChatbotButton } from "@/components/demo-chatbot/FloatingDemoChatbotButton";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      {children}
      <FloatingDemoChatbotButton />
    </div>
  );
}
