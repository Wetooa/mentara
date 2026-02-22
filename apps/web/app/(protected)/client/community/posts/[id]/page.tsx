import { Suspense } from "react";
import { PostDetailContent, PostDetailLoading } from "./PostDetailClient";

export default function PostDetailPage() {
  return (
    <Suspense fallback={<PostDetailLoading />}>
      <PostDetailContent />
    </Suspense>
  );
}
