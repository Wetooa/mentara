# Community Group Sessions Components

This directory contains all components related to the Community Group Sessions feature, allowing therapists and moderators to host virtual or in-person sessions with community members.

## 📋 Components Overview

### Core Components

#### `SessionCard`
Display card for individual sessions with key information and quick actions.

```tsx
import { SessionCard } from "@/components/community/sessions";

<SessionCard
  session={session}
  onViewDetails={(session) => console.log("View", session)}
  onRSVP={(sessionId, status) => console.log("RSVP", sessionId, status)}
  variant="default" // or "compact"
/>
```

#### `SessionsList`
Full-featured list with filtering, sorting, and tabs for different session states.

```tsx
import { SessionsList } from "@/components/community/sessions";

<SessionsList
  sessions={sessions}
  onViewDetails={handleViewDetails}
  onRSVP={handleRSVP}
  onCreateSession={handleCreateSession}
  canCreateSession={true}
  communityId="community-1"
  isLoading={false}
/>
```

#### `SessionDetailModal`
Modal dialog showing complete session information with RSVP functionality.

```tsx
import { SessionDetailModal } from "@/components/community/sessions";

<SessionDetailModal
  session={selectedSession}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onRSVP={handleRSVP}
/>
```

#### `CreateSessionModal`
Modal for creating new sessions (therapists/moderators only).

```tsx
import { CreateSessionModal } from "@/components/community/sessions";

<CreateSessionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={async (data) => {
    // Handle session creation
    console.log("Creating session:", data);
  }}
  communityId="community-1"
  roomId="room-1"
/>
```

### Utility Components

#### `UpcomingSessionsWidget`
Compact widget for sidebars showing next few upcoming sessions.

```tsx
import { UpcomingSessionsWidget } from "@/components/community/sessions";

<UpcomingSessionsWidget
  sessions={upcomingSessions}
  onViewSession={(session) => console.log("View", session)}
  onViewAll={() => router.push("/sessions")}
  maxSessions={3}
/>
```

#### `SessionManagement`
Full management dashboard for therapists/moderators to manage their sessions.

```tsx
import { SessionManagement } from "@/components/community/sessions";

<SessionManagement
  sessions={sessions}
  onCreateSession={handleCreate}
  onEditSession={handleEdit}
  onDeleteSession={handleDelete}
  onDuplicateSession={handleDuplicate}
  onCancelSession={handleCancel}
/>
```

#### `CommunityContentTabs`
Wrapper component that adds a sessions tab alongside posts in community view.

```tsx
import { CommunityContentTabs } from "@/components/community/CommunityContentTabs";

<CommunityContentTabs
  postsContent={<YourPostsComponent />}
  communityId="community-1"
  roomId="room-1"
  canCreateSession={role === "therapist" || role === "moderator"}
/>
```

## 🗂️ Types

All TypeScript types are defined in `/types/api/sessions.ts`:

- `GroupSession` - Main session object
- `SessionType` - "virtual" | "in-person" | "hybrid"
- `SessionFormat` - "group-therapy" | "workshop" | "support-circle" | "webinar" | "meditation" | "social"
- `SessionStatus` - "upcoming" | "ongoing" | "completed" | "cancelled"
- `SessionHost` - Host information
- `CreateSessionRequest` - Data for creating sessions

## 🎣 Hooks

### `useSessions(filters?)`
Main hook for fetching and managing sessions with mock data.

```tsx
import { useSessions } from "@/hooks/community/useSessions";

const { sessions, isLoading, handleRSVP, getSession, refreshSessions } = useSessions({
  communityId: "community-1",
  status: ["upcoming", "ongoing"],
});
```

### `useUpcomingSessions(communityId?)`
Hook specifically for upcoming sessions.

### `useSessionDetail(sessionId)`
Hook for individual session details with RSVP capability.

## 📊 Mock Data

Mock session data is available in `/lib/mock-data/sessions.ts`:

- `mockSessions` - Array of 8 diverse sample sessions
- `getUpcomingSessions(communityId?)` - Filter upcoming
- `getOngoingSessions(communityId?)` - Filter ongoing
- `getCompletedSessions(communityId?)` - Filter completed
- `getSessionById(sessionId)` - Get single session
- `mockRSVPToSession(sessionId, status)` - Simulate RSVP action

## 🎨 Features

### Session Types
- **Virtual** - Online meetings with video links
- **In-Person** - Physical locations
- **Hybrid** - Both virtual and physical options

### Session Formats
- Group Therapy
- Workshop
- Support Circle
- Webinar
- Meditation
- Social Events

### User Features
- Browse and filter sessions
- RSVP to join sessions
- Join waitlist when full
- View session details
- Download calendar events (.ics)
- Copy meeting links
- View session materials

### Host Features (Therapists/Moderators)
- Create new sessions
- Edit existing sessions
- Cancel sessions
- Delete sessions
- Duplicate sessions
- View participant lists
- Manage capacity and waitlists

## 📝 Usage Examples

### Basic Integration in Community Page

```tsx
// In your community page component
import { CommunityContentTabs } from "@/components/community/CommunityContentTabs";

export default function CommunityPage() {
  return (
    <CommunityContentTabs
      postsContent={
        <div>
          {/* Your existing posts UI */}
        </div>
      }
      communityId={selectedCommunityId}
      roomId={selectedRoomId}
      canCreateSession={userRole === "therapist" || userRole === "moderator"}
    />
  );
}
```

### Sidebar Integration

```tsx
// In your sidebar component
import { UpcomingSessionsWidget } from "@/components/community/sessions";
import { useUpcomingSessions } from "@/hooks/community/useSessions";

export function Sidebar() {
  const { sessions } = useUpcomingSessions("community-1");
  
  return (
    <div>
      {/* Other sidebar content */}
      <UpcomingSessionsWidget
        sessions={sessions}
        onViewSession={handleViewSession}
        onViewAll={() => setActiveTab("sessions")}
      />
    </div>
  );
}
```

### Standalone Sessions Page

```tsx
// For a dedicated sessions page
import { SessionsList } from "@/components/community/sessions";
import { useSessions } from "@/hooks/community/useSessions";

export default function SessionsPage() {
  const { sessions, isLoading, handleRSVP } = useSessions();
  
  return (
    <SessionsList
      sessions={sessions}
      onViewDetails={handleViewDetails}
      onRSVP={handleRSVP}
      canCreateSession={canCreate}
      isLoading={isLoading}
    />
  );
}
```

## 🔮 Future Enhancements

When ready to connect to real API:

1. Replace mock data in `useSessions` hook with actual API calls
2. Update `handleRSVP` to call backend endpoint
3. Add real-time updates for session status changes
4. Implement notifications for session reminders
5. Add video conferencing integration
6. Enable recurring session patterns
7. Add participant management features

## 📦 Dependencies

- `date-fns` - Date formatting and manipulation
- `sonner` - Toast notifications
- `lucide-react` - Icons
- All standard shadcn/ui components

---

Built with ❤️ for the Mentara mental health platform

