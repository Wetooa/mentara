"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// Required for static export
export function generateStaticParams() {
  return [];
}
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostDetail } from "@/hooks/community";
import { PostDetail } from "@/components/community/PostDetail";
import { MentaraApiError } from "@/lib/api/errorHandler";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { BackButton } from "@/components/navigation/BackButton";

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const { 
    post, 
    isLoading, 
    isError, 
    error, 
    deletePost
  } = usePostDetail(postId);

  const handleBackToCommunity = () => {
    router.push("/therapist/community");
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit post functionality not yet implemented");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost();
      setTimeout(() => {
        router.push("/therapist/community");
      }, 1000);
    }
  };

  if (isLoading) {
    return <PostDetailLoading />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumbs */}
          <PageBreadcrumbs />
          
          {/* Back Navigation */}
          <div className="mb-6">
            <BackButton
              label="Back to Community"
              href="/therapist/community"
              variant="ghost"
            />
          </div>

          {/* Error Display */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
                  <p className="text-muted-foreground mb-4">
                    {error instanceof MentaraApiError && error.status === 404
                      ? "The post you're looking for doesn't exist or has been deleted."
                      : "Unable to load the post. Please try again later."}
                  </p>
                  <Button onClick={handleBackToCommunity}>
                    Return to Community
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!post) {
    return <PostDetailLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <PageBreadcrumbs
          context={{
            postTitle: post.title || "Post",
          }}
        />
        
        {/* Back Button */}
        <div className="mb-6">
          <BackButton
            label="Back to Community"
            href="/therapist/community"
            variant="ghost"
          />
        </div>
        
        {/* Post Detail */}
        <PostDetail 
          post={post}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

export default function PostDetailPage() {
  return (
    <Suspense fallback={<PostDetailLoading />}>
      <PostDetailContent />
    </Suspense>
  );
}