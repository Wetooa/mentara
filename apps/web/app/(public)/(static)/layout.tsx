import Navbar from "@/components/navbar/static-navbar/navbar";
import React from "react";  

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
