"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Required for static export
export function generateStaticParams() {
  return [];
}

export default function TherapistApplicationDetailRedirectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new therapists route with the same ID
    router.replace(`/admin/therapists/${params.id}`);
  }, [router, params.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-gray-600">Redirecting to Therapist Details...</p>
    </div>
  );
}