import { Suspense } from "react";
import { ClientProfilePageContent } from "./ClientProfilePageContent";

export default function ClientProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading profile...</div>}>
      <ClientProfilePageContent />
    </Suspense>
  );
}

