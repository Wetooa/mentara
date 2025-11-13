# Booking System & Timezone Handling - Comprehensive Audit

**Date:** October 15, 2025  
**Status:** Critical Issues Identified - Implementation Required

---

## Executive Summary

Found **8 critical issues** in the booking system and timezone handling:

1. ❌ **Incorrect booking time restriction** (30 mins instead of 1 day)
2. ❌ **Poor UX** - backwards booking flow (slot→duration instead of duration→slot)
3. ❌ **No timezone handling** - everything is UTC-only
4. ❌ **No user timezone preferences** - users can't set their timezone
5. ❌ **No timezone display** - users don't know what timezone they're in
6. ❌ **Duration-locked slots** - can't see all available slots for a duration
7. ❌ **No range-based selection** - should use same UI as therapist schedule management
8. ❌ **Backend has timezone support but frontend doesn't use it**

---

## Issue #1: Booking Time Restriction (30 mins → 24 hours)

### Current State

**Frontend:**

```typescript:42:42:mentara-web/hooks/booking/useAvailableSlots.ts
throw new Error('Bookings must be made at least 30 minutes in advance');
```

```typescript:87:87:mentara-web/components/booking/BookingCalendar.tsx
disabled={(date) => {
  return TimezoneUtils.isPast(date) || !TimezoneUtils.canBook(date, 0.5); // ← 0.5 hours = 30 mins
}}
```

```typescript:152:152:mentara-web/components/booking/BookingCalendar.tsx
? 'Cannot book appointments for this date. Please select a time at least 30 minutes in advance.'
```

```typescript:63:63:mentara-web/lib/utils/timezone.ts
export function canBookInAdvanceUTC(date: Date | string, minAdvanceHours: number = 0.5): boolean {
  // ← Default is 0.5 hours = 30 mins
}
```

**Backend:**

```typescript:29:32:mentara-api/src/booking/services/availability-validator.service.ts
advanceBooking: {
  minHours: 2,  // ← Backend expects 2 hours minimum
  maxDays: 90,
},
```

```typescript:485:491:mentara-api/src/booking/booking.service.ts
if (meetingPayment && cancellationNotice >= 24) {
  // 24-hour cancellation policy ← This is correct!
  this.logger.log(`Refund needed for cancelled session ${meeting.id} - ${cancellationNotice}h notice`);
  // TODO: Implement refund processing in billing service
}
```

### Problem

- **Frontend says**: "30 minutes in advance"
- **Backend says**: "2 hours minimum" (validator service)
- **Cancellation policy says**: "24 hours for refund"
- **User expects**: "1 day in advance"

### Fix Required

Change all to **24 hours (1 day)** minimum booking time to align with cancellation policy.

---

## Issue #2: Backwards Booking UX Flow

### Current Flow (BAD UX)

1. User selects a **date** ✅
2. User sees **all available time slots** (e.g., 9:00 AM, 10:00 AM, etc.)
3. User clicks a **time slot** (e.g., 9:00 AM)
4. User then sees **available durations** for that specific slot (30, 60, 90 mins)
5. User selects **duration**
6. User completes booking

**Problems:**

- User doesn't know if their preferred duration is available before clicking
- Must click multiple slots to find one with desired duration
- Backwards logic - duration should dictate slot availability

### Desired Flow (GOOD UX)

1. User selects a **date** ✅
2. User selects **preferred duration** FIRST (30, 60, 90, 120 mins)
3. User sees **only slots that accommodate that duration**
4. Slots are displayed as **time ranges** (e.g., "9:00 AM - 10:00 AM" for 60 min)
5. User clicks a slot and books immediately

**Benefits:**

- Clearer UX - user knows exactly what they're getting
- Fewer clicks - no back-and-forth
- Shows duration-specific availability upfront

### Code References

**Current Implementation:**

```typescript:216:242:mentara-web/components/booking/BookingModal.tsx
{/* Duration Selection */}
{selectedSlot && (  // ← Duration selection only shows AFTER slot selection
  <div>
    <Label className="text-base font-semibold">
      Session Duration
    </Label>
    <div className="mt-2 grid grid-cols-2 gap-2">
      {selectedSlot.availableDurations.map((duration) => (  // ← Limited by slot
        <Card
          key={duration.id}
          className={...}
          onClick={() => setSelectedDuration(duration)}
        >
          ...
        </Card>
      ))}
    </div>
  </div>
)}
```

---

## Issue #3: No Timezone Handling

### Current State

**Frontend** (UTC-only):

```typescript:2:3:mentara-web/lib/utils/timezone.ts
/**
 * Simplified UTC-only timezone utilities (replacing Asia/Manila logic)
 */
```

**Mock Data** (has timezones but not used):

```typescript:126:126:mentara-web/lib/mock-data/sessions.ts
timezone: "America/New_York",
```

**Backend** (has timezone field but not applied to bookings):

```typescript:204:204:mentara-api/src/users/users.controller.ts
'timezone',  // ← User has timezone field
```

```typescript:24:24:mentara-api/src/booking/services/availability-validator.service.ts
timezone: 'UTC',  // ← But bookings are hardcoded to UTC
```

### Problems

1. **No timezone conversion** - all times stored/displayed in UTC or user's local time (inconsistent)
2. **Therapist in US, Client in Asia** - what time is 2:00 PM?
3. **DST issues** - daylight saving time not handled
4. **No timezone selection** - users can't set preferred timezone
5. **No timezone display** - users don't know what timezone they're viewing

### Example Scenario

```
Therapist: New York (EST/EDT) - UTC-5/-4
Client: Manila (PHT) - UTC+8
Booking time: 2:00 PM

What does "2:00 PM" mean?
- 2:00 PM Manila time? → 2:00 AM NYC (therapist sleeping!)
- 2:00 PM NYC time? → 2:00 AM Manila (client sleeping!)
- 2:00 PM UTC? → 10:00 AM NYC, 10:00 PM Manila (maybe OK?)

Current system: UNDEFINED! 🚨
```

---

## Issue #4: No User Timezone Preferences

### Current State

**Database Schema:**

```prisma
model User {
  timezone String?  // ← Field exists but not used
}
```

**API:**

- User can update timezone via profile API
- But frontend doesn't use it
- Bookings don't consider it

### What's Needed

1. **Settings page** where users can select timezone
2. **Timezone selector** component (dropdown with major timezones)
3. **Store timezone preference** in database
4. **Apply timezone** to all time displays and booking operations
5. **Default timezone** - detect from browser, allow override

---

## Issue #5: No Timezone Display/Clock

### Current State

No indication anywhere of:

- What timezone the user is currently viewing
- What timezone times are displayed in
- What timezone the therapist operates in

### What's Needed

1. **Global timezone clock** in header/sidebar showing:

   ```
   Your time: 2:00 PM PHT (Manila)
   Therapist time: 2:00 AM EST (New York)
   ```

2. **Timezone badges** on time displays:

   ```
   9:00 AM EST  ← Shows timezone
   or
   9:00 AM (your time)  ← Converted to user's timezone
   ```

3. **Dual-time display** when booking:
   ```
   9:00 AM - 10:00 AM EST
   (10:00 PM - 11:00 PM PHT)  ← Shows both
   ```

---

## Issue #6: No Range-Based Booking UI

### Current State

User sees discrete time slots: 9:00, 9:30, 10:00, 10:30...

### User Wants

Range-based selection like therapist schedule management:

- Visual calendar grid showing availability
- Drag-and-drop or click-to-select time ranges
- Color-coded availability (green=available, red=booked, gray=unavailable)
- See therapist's full schedule for context

**Benefit**: Same UX pattern as therapist uses for setting availability

---

## Issue #7: Backend vs Frontend Mismatch

### Backend

- Has timezone support in database
- Has timezone validation methods
- Has proper timezone fields in DTOs

### Frontend

- Ignores all timezone data
- Uses "UTC-only" utilities
- Doesn't send timezone to API
- Doesn't display timezone

**Problem**: Backend is ready, frontend isn't using it!

---

## Issue #8: Duration-Locked Slots

### Current Problem

```typescript:205:215:mentara-web/components/booking/BookingCalendar.tsx
<div className="flex flex-wrap gap-1">
  {availableDurations.map((duration) => (
    <Badge key={duration.id} variant="outline" className="text-xs">
      {duration.duration}min
    </Badge>
  ))}
</div>
```

User sees: "9:00 AM has 30, 60 mins available"

**But what if user wants 90 mins?**

- Must scroll through all slots to find one with 90 mins
- No way to filter by duration
- Inefficient UX

### Solution

Duration-first selection (see Issue #2)

---

## Implementation Plan

### Phase 1: Critical Fixes (High Priority)

#### 1.1 Fix Booking Time Restriction

- [ ] Change frontend from 0.5 hours to 24 hours
- [ ] Update error messages
- [ ] Update backend validator to 24 hours
- [ ] Add config for easy adjustment

#### 1.2 Implement Duration-First UX

- [ ] Add duration selector ABOVE slot selection
- [ ] Filter slots by selected duration
- [ ] Show time ranges based on duration
- [ ] Update API to support duration filtering

### Phase 2: Timezone Foundation (High Priority)

#### 2.1 User Timezone Preferences

- [ ] Create user settings table/section
- [ ] Build timezone selector component
- [ ] Save timezone preference to database
- [ ] Load and apply user timezone

#### 2.2 Timezone Display

- [ ] Add timezone clock to header
- [ ] Show timezone on all time displays
- [ ] Add timezone badge component
- [ ] Implement dual-time display for bookings

#### 2.3 Timezone Conversion

- [ ] Replace UTC-only utils with proper timezone handling
- [ ] Use date-fns-tz or moment-timezone
- [ ] Convert all times to user's timezone for display
- [ ] Convert to therapist's timezone for availability checks
- [ ] Store all times as UTC in database

### Phase 3: UX Improvements (Medium Priority)

#### 3.1 Range-Based Booking UI

- [ ] Build calendar grid component
- [ ] Add drag-to-select functionality
- [ ] Color-code availability
- [ ] Show therapist's full schedule
- [ ] Match therapist schedule management UI

#### 3.2 Better Slot Display

- [ ] Show slots as time ranges
- [ ] Group consecutive slots
- [ ] Show breaks/gaps in availability
- [ ] Add time zone conversion labels

### Phase 4: Backend Enhancements (Medium Priority)

#### 4.1 API Timezone Support

- [ ] Add timezone parameter to all booking endpoints
- [ ] Return times in requested timezone
- [ ] Validate timezone parameters
- [ ] Document timezone behavior

#### 4.2 Database Cleanup

- [ ] Ensure all timestamps are UTC
- [ ] Add timezone columns where needed
- [ ] Create migration for existing data
- [ ] Add timezone indexes for performance

---

## Files to Modify

### Frontend (High Priority)

```
✅ Fix Time Restriction:
- hooks/booking/useAvailableSlots.ts (line 42)
- components/booking/BookingCalendar.tsx (line 87, 152)
- lib/utils/timezone.ts (line 63)

✅ Duration-First UX:
- components/booking/BookingModal.tsx (reorder flow)
- components/booking/BookingCalendar.tsx (add duration filter)
- hooks/booking/useBookingFlow.ts (update logic)

✅ Timezone Handling:
- lib/utils/timezone.ts (replace with proper tz library)
- components/common/TimezoneClock.tsx (NEW)
- components/settings/TimezoneSelector.tsx (NEW)
- All time display components

✅ User Settings:
- app/(protected)/client/settings/page.tsx (NEW)
- app/(protected)/therapist/settings/page.tsx (NEW)
- hooks/settings/useUserSettings.ts (NEW)
```

### Backend (Medium Priority)

```
✅ Time Restriction:
- src/booking/services/availability-validator.service.ts (line 30)
- src/booking/booking.service.ts (update validation)

✅ Timezone Support:
- src/booking/services/slot-generator.service.ts (timezone-aware)
- src/booking/services/availability-validator.service.ts (use user timezone)
- src/booking/booking.controller.ts (accept timezone param)

✅ User Settings:
- src/users/users.controller.ts (add settings endpoint)
- src/users/users.service.ts (settings CRUD)
```

---

## Testing Requirements

### Unit Tests

- [ ] Timezone conversion accuracy
- [ ] DST transitions
- [ ] Booking time validation
- [ ] Duration filtering logic

### Integration Tests

- [ ] End-to-end booking flow
- [ ] Timezone display across app
- [ ] User settings persistence

### Manual Testing

- [ ] Book with different timezones
- [ ] Check time displays
- [ ] Verify cancellation timing
- [ ] Test edge cases (midnight, DST changes)

---

## Migration Plan

### Data Migration

1. **Existing bookings** - assume UTC, no conversion needed
2. **User timezones** - detect from browser, set default
3. **Therapist schedules** - update to include timezone

### Rollout Strategy

1. **Phase 1** - Deploy backend timezone support (backwards compatible)
2. **Phase 2** - Deploy frontend with timezone detection (soft launch)
3. **Phase 3** - Force users to select timezone (hard requirement)
4. **Phase 4** - Enable full timezone features

---

## Success Metrics

- [ ] Zero timezone-related booking conflicts
- [ ] 90%+ users set preferred timezone
- [ ] Booking time restriction = 24 hours everywhere
- [ ] Duration-first selection reduces clicks by 50%
- [ ] Users can see therapist timezone clearly

---

## Estimated Effort

| Phase                          | Tasks        | Estimated Time  |
| ------------------------------ | ------------ | --------------- |
| Phase 1 - Critical Fixes       | 4 tasks      | 4-6 hours       |
| Phase 2 - Timezone Foundation  | 12 tasks     | 12-16 hours     |
| Phase 3 - UX Improvements      | 8 tasks      | 8-12 hours      |
| Phase 4 - Backend Enhancements | 8 tasks      | 8-10 hours      |
| **Total**                      | **32 tasks** | **32-44 hours** |

---

## Risks & Mitigation

| Risk                                        | Impact | Mitigation                                       |
| ------------------------------------------- | ------ | ------------------------------------------------ |
| DST transitions break bookings              | HIGH   | Use battle-tested timezone library (date-fns-tz) |
| Performance issues with timezone conversion | MEDIUM | Cache converted times, use indexes               |
| User confusion with multiple timezones      | MEDIUM | Clear UI, tooltips, dual-time display            |
| Data migration errors                       | HIGH   | Test thoroughly, have rollback plan              |

---

## Next Steps

1. ✅ **Review this audit** with team
2. **Prioritize fixes** - start with Phase 1
3. **Create detailed implementation tickets**
4. **Begin development** - critical fixes first
5. **Test thoroughly** - timezone bugs are nasty!

---

**Status:** Ready for implementation  
**Priority:** HIGH - affects all booking operations  
**Dependencies:** None - can start immediately

