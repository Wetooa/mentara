# Booking Module - Comprehensive Analysis

**Date**: October 14, 2025  
**Module**: Booking  
**Total Lines**: 3,426 lines across 10 TypeScript files

---

## 📊 **CURRENT STATE**

### File Structure

```
booking/
├── booking.controller.ts           (239 lines) ✅ Clean
├── booking.service.ts              (993 lines) 🟡 LARGE!
├── booking.module.ts               (25 lines) ✅ Clean
├── services/
│   ├── slot-generator.service.ts         (322 lines) ✅ Well-structured
│   ├── conflict-detection.service.ts     (366 lines) ✅ Well-structured
│   └── availability-validator.service.ts (428 lines) ✅ Well-structured
├── types/
│   ├── booking.dto.ts
│   └── index.ts
├── validation/
│   └── booking.schemas.ts
└── constants/
    └── meeting-status.constants.ts
```

---

## ✅ **WHAT'S GOOD**

### 1. **Excellent Service Separation** ⭐

Already has specialized services for:

- `SlotGeneratorService` - Time slot generation
- `ConflictDetectionService` - Scheduling conflicts
- `AvailabilityValidatorService` - Validation rules

### 2. **Transaction Safety** ⭐

```typescript
// Race condition prevention!
const result = await this.prisma.$transaction(
  async (tx) => {
    // Lock therapist and client schedules
    // Check conflicts atomically
    // Create meeting
  },
  {
    isolationLevel: 'Serializable',
    timeout: 10000,
  },
);
```

### 3. **Event-Driven Architecture** ⭐

Emits events for:

- `AppointmentBookedEvent`
- `AppointmentCancelledEvent`
- `AppointmentCompletedEvent`
- `AppointmentRescheduledEvent`

### 4. **Proper Logging** ⭐

Already using `Logger` in main service:

```typescript
private readonly logger = new Logger(BookingService.name);
this.logger.log('Meeting completed...');
```

### 5. **Comprehensive Validation** ⭐

- Time format validation
- Business hours checking
- Advance booking constraints
- Therapist-client relationship validation

---

## 🔴 **ISSUES FOUND**

### 1. **Console.log Debugging** (9 instances)

**slot-generator.service.ts** (8 debug logs):

```typescript
console.log(`[SlotGenerator] Generating slots for therapist ${therapistId}`);
console.log(
  `[SlotGenerator] Found ${availability.length} availability records`,
);
// + 6 more debug logs
```

**booking.service.ts** (1 error log):

```typescript
console.error('Failed to process refund for cancelled meeting:', refundError);
// Should use this.logger.error instead
```

### 2. **Booking Service Too Large** (993 lines!)

Current responsibilities:

- Meeting CRUD (creation, read, update, delete)
- Meeting lifecycle (accept, start, complete, no-show)
- Availability CRUD
- Slot generation (delegated)
- Conflict detection (delegated)
- Payment creation
- Event emission

**Should be split into**:

- `MeetingManagementService` (~300 lines)
- `MeetingLifecycleService` (~200 lines)
- `AvailabilityManagementService` (~200 lines)
- Keep main `BookingService` as orchestrator (~200 lines)

### 3. **Hardcoded Pricing** 💰

```typescript
const sessionPrice = 100; // Mock session price
```

**Issues**:

- Not using therapist's actual rates
- Not considering session duration
- Not accounting for different pricing tiers

**Should be**:

```typescript
const therapist = await tx.therapist.findUnique({
  where: { userId: therapistId },
  select: { hourlyRate: true },
});
const sessionPrice = (duration / 60) * (therapist?.hourlyRate ?? 100);
```

### 4. **Response Transformation Duplication** (8 times!)

Same transformation repeated everywhere:

```typescript
return {
  ...meeting,
  dateTime: meeting.startTime,
  therapistName: meeting.therapist?.user
    ? `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`
    : 'Unknown Therapist',
};
```

**Should extract to**:

```typescript
private transformMeetingResponse(meeting: any) {
  return {
    ...meeting,
    dateTime: meeting.startTime,
    therapistName: this.getTherapistName(meeting.therapist),
  };
}
```

### 5. **Incomplete Refund Logic** 🚧

```typescript
// TODO: Implement refund processing in billing service
if (meetingPayment && cancellationNotice >= 24) {
  this.logger.log(`Refund needed...`);
  // TODO: Actual refund processing
}
```

### 6. **Meeting Notes Duplication**

Same logic in `completeMeeting()` and `saveMeetingNotes()`:

```typescript
const existingNotes = await this.prisma.meetingNotes.findFirst({
  where: { meetingId },
});
if (existingNotes) {
  await this.prisma.meetingNotes.update({ ... });
} else {
  await this.prisma.meetingNotes.create({ ... });
}
```

---

## 💡 **RECOMMENDATIONS**

### **Priority 1: Quick Fixes** (~30 min)

#### 1.1 Replace Console.logs with Logger

```typescript
// slot-generator.service.ts
export class SlotGeneratorService {
  private readonly logger = new Logger(SlotGeneratorService.name);

  // Replace all console.log with this.logger.debug
  this.logger.debug(`Generating slots for therapist ${therapistId}`);
}
```

#### 1.2 Fix Console.error in booking.service.ts

```typescript
// Line 505-508
this.logger.error('Failed to process refund:', refundError);
```

#### 1.3 Extract Response Transformer

```typescript
// Create: services/meeting-response.transformer.ts
export class MeetingResponseTransformer {
  static transform(meeting: any) {
    return {
      ...meeting,
      dateTime: meeting.startTime,
      therapistName: this.getTherapistName(meeting.therapist),
      clientName: this.getClientName(meeting.client),
    };
  }
}
```

---

### **Priority 2: Refactoring** (~3 hours)

#### 2.1 Split BookingService

**New Structure**:

```
booking/
├── booking.service.ts (orchestrator ~200 lines)
├── services/
│   ├── meeting-management.service.ts      [NEW!]
│   ├── meeting-lifecycle.service.ts       [NEW!]
│   ├── availability-management.service.ts [NEW!]
│   ├── pricing.service.ts                 [NEW!]
│   ├── meeting-response.transformer.ts    [NEW!]
│   ├── slot-generator.service.ts          (existing)
│   ├── conflict-detection.service.ts      (existing)
│   └── availability-validator.service.ts  (existing)
```

**MeetingManagementService** (~300 lines):

- `createMeeting()`
- `getMeetings()`
- `getMeeting()`
- `updateMeeting()`
- `cancelMeeting()`

**MeetingLifecycleService** (~200 lines):

- `acceptMeetingRequest()`
- `startMeeting()`
- `completeMeeting()`
- `markNoShow()`
- `saveMeetingNotes()`

**AvailabilityManagementService** (~200 lines):

- `createAvailability()`
- `getAvailability()`
- `updateAvailability()`
- `deleteAvailability()`
- `getAvailableSlots()`

**PricingService** (NEW ~100 lines):

```typescript
export class PricingService {
  async calculateSessionPrice(
    therapistId: string,
    duration: number,
    sessionType?: string,
  ): Promise<number> {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      select: { hourlyRate: true },
    });

    const hourlyRate = therapist?.hourlyRate ?? 100;
    const basePrice = (duration / 60) * hourlyRate;

    // Apply multipliers based on session type
    const multiplier = sessionType === 'initial' ? 1.5 : 1.0;

    return Math.round(basePrice * multiplier * 100) / 100;
  }

  async calculateRefundAmount(
    meetingId: string,
    cancellationNoticeHours: number,
  ): Promise<number> {
    // 24+ hours: 100% refund
    // 12-24 hours: 50% refund
    // <12 hours: 0% refund
    if (cancellationNoticeHours >= 24) return 1.0;
    if (cancellationNoticeHours >= 12) return 0.5;
    return 0;
  }
}
```

#### 2.2 Implement Proper Pricing

```typescript
// Replace hardcoded $100
const sessionPrice = await this.pricingService.calculateSessionPrice(
  therapistId,
  duration,
  isInitialConsultation ? 'initial' : 'regular',
);
```

#### 2.3 Implement Refund Processing

```typescript
if (meetingPayment && cancellationNotice >= 24) {
  const refundPercentage = await this.pricingService.calculateRefundAmount(
    meeting.id,
    cancellationNotice,
  );

  if (refundPercentage > 0) {
    await this.billingService.processRefund(
      meetingPayment.id,
      meetingPayment.amount * refundPercentage,
    );
  }
}
```

---

### **Priority 3: Business Logic Enhancements** (~2-3 hours)

#### 3.1 Cancellation Policies

```typescript
export interface CancellationPolicy {
  name: string;
  minimumNoticeHours: number;
  refundPercentage: number;
  cancellationFee: number;
}

const CANCELLATION_POLICIES: CancellationPolicy[] = [
  {
    name: 'full-refund',
    minimumNoticeHours: 24,
    refundPercentage: 100,
    cancellationFee: 0,
  },
  {
    name: 'partial-refund',
    minimumNoticeHours: 12,
    refundPercentage: 50,
    cancellationFee: 0,
  },
  {
    name: 'no-refund',
    minimumNoticeHours: 0,
    refundPercentage: 0,
    cancellationFee: 25,
  },
];
```

#### 3.2 Smart Rescheduling

```typescript
async suggestRescheduleSlots(
  meetingId: string,
  preferredDate?: string
): Promise<TimeSlot[]> {
  const meeting = await this.getMeeting(meetingId);

  // Find similar time slots within next 7 days
  const suggestions = [];
  for (let day = 1; day <= 7; day++) {
    const date = new Date(meeting.startTime);
    date.setDate(date.getDate() + day);

    const slots = await this.getAvailableSlots(
      meeting.therapistId,
      date.toISOString()
    );

    suggestions.push(...slots);
  }

  return suggestions.slice(0, 10); // Top 10 suggestions
}
```

#### 3.3 Recurring Appointments

```typescript
async createRecurringMeetings(
  createMeetingDto: MeetingCreateDto,
  recurrencePattern: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    occurrences: number;
    endDate?: Date;
  }
): Promise<Meeting[]> {
  // Create multiple meetings based on recurrence pattern
  // Validate all slots before creating any
  // Handle failures gracefully (partial success)
}
```

#### 3.4 Waitlist System

```typescript
async joinWaitlist(
  clientId: string,
  therapistId: string,
  preferredTimes: { dayOfWeek: number; timeRange: string }[]
): Promise<WaitlistEntry> {
  // Add client to waitlist for therapist
  // Notify when slots matching preferences become available
}
```

#### 3.5 Automatic Reminders

```typescript
// In booking.service.ts or new reminder.service.ts
async scheduleReminders(meetingId: string): Promise<void> {
  const meeting = await this.getMeeting(meetingId);

  // Schedule reminders:
  // - 24 hours before
  // - 1 hour before
  // - 15 minutes before (for therapist)

  await this.eventBus.emit(new ReminderScheduledEvent({
    meetingId,
    reminderTimes: [
      new Date(meeting.startTime.getTime() - 24 * 60 * 60 * 1000),
      new Date(meeting.startTime.getTime() - 60 * 60 * 1000),
      new Date(meeting.startTime.getTime() - 15 * 60 * 1000),
    ]
  }));
}
```

---

## 📋 **IMPLEMENTATION PLAN**

### **Phase 1: Quick Wins** (~30 min)

1. ✅ Add Logger to SlotGeneratorService
2. ✅ Replace 8 console.log with logger.debug
3. ✅ Replace 1 console.error with logger.error
4. ✅ Extract MeetingResponseTransformer
5. ✅ Use transformer in all methods

### **Phase 2: Refactoring** (~3 hours)

6. ✅ Create PricingService
7. ✅ Implement dynamic pricing
8. ✅ Create MeetingManagementService
9. ✅ Create MeetingLifecycleService
10. ✅ Create AvailabilityManagementService
11. ✅ Refactor BookingService to orchestrator
12. ✅ Update module imports

### **Phase 3: Business Logic** (~3 hours)

13. ✅ Implement refund processing
14. ✅ Add cancellation policies
15. ✅ Add smart rescheduling
16. ✅ Add recurring appointments (optional)
17. ✅ Add waitlist system (optional)
18. ✅ Add reminder scheduling

---

## 🎯 **ESTIMATED IMPACT**

| Metric                  | Before         | After (Phase 1) | After (All Phases) |
| ----------------------- | -------------- | --------------- | ------------------ |
| **Console.logs**        | 9              | 0               | 0                  |
| **BookingService size** | 993 lines      | 993 lines       | ~200 lines         |
| **Code duplication**    | ~60 lines      | ~20 lines       | 0                  |
| **Service count**       | 4              | 5               | 8                  |
| **Pricing logic**       | Hardcoded $100 | Hardcoded $100  | Dynamic            |
| **Refund logic**        | TODO           | TODO            | Implemented        |
| **Business features**   | Basic          | Basic           | Advanced           |

---

## 🚀 **RECOMMENDED APPROACH**

### **Option A: Quick Cleanup Only** (~30 min)

- Fix console.logs
- Extract transformer
- Improve pricing (use therapist rates)
- **Result**: Cleaner code, better pricing

### **Option B: Full Refactoring** (~6 hours)

- All of Option A
- Split BookingService
- Implement refund logic
- Add cancellation policies
- **Result**: Professional-grade booking system

### **Option C: Add Business Features** (~9 hours)

- All of Option B
- Recurring appointments
- Smart rescheduling
- Waitlist system
- Reminder scheduling
- **Result**: Feature-complete booking platform

---

## 💭 **MY RECOMMENDATION**

Start with **Option A** (30 min quick cleanup):

1. Fix console.logs → Better debugging
2. Extract transformer → Less duplication
3. Dynamic pricing → More professional

Then decide if you want to continue with refactoring.

The booking module is **already well-structured** compared to what we've seen. The main service is large, but it's organized. Quick cleanup will make it production-ready!

**What would you like to do?** 🤔
