import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-white to-tertiary/50 w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
}
