"use client";

import { useState, useMemo } from "react";
import {
  GroupSession,
  SessionType,
  SessionFormat,
  SessionStatus,
} from "@/types/api/sessions";
import { SessionCard } from "./SessionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Video,
  MapPin,
  Users,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionsListProps {
  sessions: GroupSession[];
  onViewDetails?: (session: GroupSession) => void;
  onRSVP?: (sessionId: string, status: "join" | "leave") => void;
  isRSVPing?: boolean;
  onCreateSession?: () => void;
  canCreateSession?: boolean;
  communityId?: string;
  roomId?: string;
  isLoading?: boolean;
}

type ViewMode = "all" | "upcoming" | "ongoing" | "completed";
type SortBy = "date" | "popularity" | "capacity";

export function SessionsList({
  sessions,
  onViewDetails,
  onRSVP,
  isRSVPing = false,
  onCreateSession,
  canCreateSession = false,
  communityId,
  roomId,
  isLoading = false,
}: SessionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [selectedTypes, setSelectedTypes] = useState<SessionType[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<SessionFormat[]>([]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by view mode
    if (viewMode !== "all") {
      filtered = filtered.filter((s) => s.status === viewMode);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.host.name.toLowerCase().includes(query) ||
          s.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((s) => selectedTypes.includes(s.type));
    }

    // Filter by format
    if (selectedFormats.length > 0) {
      filtered = filtered.filter((s) => selectedFormats.includes(s.format));
    }

    // Filter by community only (sessions/webinars are community-level, not room-specific)
    if (communityId) {
      filtered = filtered.filter((s) => s.communityId === communityId);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        case "popularity":
          return b.currentParticipants - a.currentParticipants;
        case "capacity":
          const aCapacity = (a.currentParticipants / a.maxParticipants) * 100;
          const bCapacity = (b.currentParticipants / b.maxParticipants) * 100;
          return bCapacity - aCapacity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    sessions,
    viewMode,
    searchQuery,
    selectedTypes,
    selectedFormats,
    sortBy,
    communityId,
  ]);

  const sessionCounts = useMemo(() => {
    return {
      all: sessions.length,
      upcoming: sessions.filter((s) => s.status === "upcoming").length,
      ongoing: sessions.filter((s) => s.status === "ongoing").length,
      completed: sessions.filter((s) => s.status === "completed").length,
    };
  }, [sessions]);

  const handleTypeToggle = (type: SessionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleFormatToggle = (format: SessionFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedFormats([]);
    setSortBy("date");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedTypes.length > 0 ||
    selectedFormats.length > 0 ||
    sortBy !== "date";

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Upcoming Webinars</h2>
          <p className="text-sm text-muted-foreground">
            Join virtual or in-person sessions led by therapists and moderators
          </p>
        </div>
        {canCreateSession && (
          <Button onClick={onCreateSession}>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Type
              {selectedTypes.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {selectedTypes.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Session Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedTypes.includes("virtual")}
              onCheckedChange={() => handleTypeToggle("virtual")}
            >
              <Video className="h-4 w-4 mr-2" />
              Virtual
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedTypes.includes("in-person")}
              onCheckedChange={() => handleTypeToggle("in-person")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              In-Person
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedTypes.includes("hybrid")}
              onCheckedChange={() => handleTypeToggle("hybrid")}
            >
              <Users className="h-4 w-4 mr-2" />
              Hybrid
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Format Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Format
              {selectedFormats.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {selectedFormats.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Session Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(
              [
                "group-therapy",
                "workshop",
                "support-circle",
                "webinar",
                "meditation",
                "social",
              ] as SessionFormat[]
            ).map((format) => (
              <DropdownMenuCheckboxItem
                key={format}
                checked={selectedFormats.includes(format)}
                onCheckedChange={() => handleFormatToggle(format)}
              >
                {format
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortBy)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="capacity">Capacity</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {sessionCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            <Badge variant="secondary" className="ml-2">
              {sessionCounts.upcoming}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            Live
            {sessionCounts.ongoing > 0 && (
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {sessionCounts.ongoing}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Past
            <Badge variant="secondary" className="ml-2">
              {sessionCounts.completed}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="mt-6">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || hasActiveFilters
                  ? "Try adjusting your filters"
                  : `No ${viewMode !== "all" ? viewMode : ""} sessions available`}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onViewDetails={onViewDetails}
                  onRSVP={onRSVP}
                  isRSVPing={isRSVPing}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
