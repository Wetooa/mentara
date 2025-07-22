import { Metadata } from "next";
import React from "react";
import { generatePageMetadata, SITE_CONFIG } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Secure Dashboard",
  description: "Access your secure Mentara dashboard with personalized mental health tools, therapy sessions, and community support. Your privacy and data are protected with enterprise-grade security.",
  keywords: [
    "secure dashboard",
    "mental health dashboard", 
    "therapy portal",
    "private mental health",
    "encrypted therapy",
    "HIPAA compliant",
    "personal wellness",
    "therapy sessions",
    "mental health tracking"
  ],
  noIndex: true, // Protected content should not be indexed by search engines
  type: "website",
});

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="protected-layout">{children}</div>;
}
