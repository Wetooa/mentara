"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PostDetailPageProps {
  params: { id: string };
}

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const handleBackToCommunity = () => {
    router.push("/therapist/community");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToCommunity}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Button>
        </div>

        {/* Post Detail Container */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Post Detail</h1>
                <p className="text-muted-foreground mb-4">
                  Loading post with ID: {postId}
                </p>
                <p className="text-sm text-muted-foreground">
                  This is a placeholder. The PostDetail component will be implemented next.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Post Detail Skeleton */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  return (
    <Suspense fallback={<PostDetailLoading />}>
      <PostDetailContent />
    </Suspense>
  );
}