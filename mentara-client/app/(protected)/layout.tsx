import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Mentara - Protected",
  description: "Mentara protected area",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="protected-layout">{children}</div>;
}
