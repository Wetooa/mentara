"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Trash2, Edit, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["journal-entries", page, limit],
    queryFn: () => api.journal.getEntries(page, limit),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.journal.deleteEntry(id),
    onSuccess: () => {
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete entry");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.journal.updateEntry(id, { content }),
    onSuccess: () => {
      toast.success("Entry updated");
      setEditingEntry(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update entry");
    },
  });

  const handleEdit = (entry: any) => {
    setEditingEntry(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = () => {
    if (editingEntry && editContent.trim()) {
      updateMutation.mutate({ id: editingEntry, content: editContent.trim() });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter entries by search query
  const filteredEntries = data?.entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl" aria-label="Journal">
      <header className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg" aria-hidden="true">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Journal</h1>
            <p className="text-muted-foreground">
              Your personal thoughts and reflections
            </p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search journal entries"
          />
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" aria-label="Loading entry date" />
                <Skeleton className="h-3 w-24" aria-label="Loading entry time" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" aria-label="Loading entry content" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card role="alert" aria-live="assertive">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Failed to load entries. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8" role="status" aria-live="polite">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No entries match your search."
                  : "No journal entries yet. Start writing to see them here."}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push("/client")} aria-label="Go to wellness tools">
                  Go to Wellness Tools
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6" role="list" aria-label="Journal entries">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} role="listitem">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {format(new Date(entry.createdAt), "h:mm a")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2" role="group" aria-label="Entry actions">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(entry)}
                        aria-label={`Edit entry from ${format(new Date(entry.createdAt), "MMMM d, yyyy")}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Delete entry from ${format(new Date(entry.createdAt), "MMMM d, yyyy")}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data && data.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent role="dialog" aria-modal="true" aria-labelledby="edit-entry-title">
          <DialogHeader>
            <DialogTitle id="edit-entry-title">Edit Entry</DialogTitle>
            <DialogDescription>
              Make changes to your journal entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px]"
              placeholder="Write your thoughts..."
              aria-label="Journal entry content"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingEntry(null);
                  setEditContent("");
                }}
                aria-label="Cancel editing entry"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateMutation.isPending}
                aria-label="Save changes to journal entry"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

