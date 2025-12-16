import { Suspense } from "react";
import { PostDetailContent, PostDetailLoading } from "./PostDetailClient";

// Required for static export - returns empty array since posts are fetched dynamically client-side
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [];
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={<PostDetailLoading />}>
      <PostDetailContent />
    </Suspense>
  );
}