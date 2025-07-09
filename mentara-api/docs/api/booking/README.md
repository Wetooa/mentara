# Booking API

The Booking API manages therapy session scheduling, therapist availability, and appointment management for the Mentara platform.

## 🏗️ Architecture

The booking system provides:
- **Session Scheduling**: Book, update, and cancel therapy sessions
- **Availability Management**: Therapists can set their available time slots
- **Conflict Detection**: Prevents double-booking and scheduling conflicts
- **Multiple Session Types**: Video, audio, in-person, and chat sessions
- **Event-Driven**: Publishes events for notifications and downstream processing
- **Role-Based Access**: Separate interfaces for clients and therapists

## 📡 API Endpoints

### Base URL
```
/booking
```

All endpoints require authentication via Clerk JWT token.

---

## 📅 Meeting Management

### Create Meeting
Book a new therapy session.

**Endpoint**: `POST /booking/meetings`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Weekly Therapy Session",
  "description": "Regular therapy session to discuss anxiety management",
  "startTime": "2024-01-15T14:00:00.000Z",
  "duration": 60,
  "meetingType": "video",
  "therapistId": "therapist_456"
}
```

**Session Durations**:
- `30`: 30 minutes
- `60`: 60 minutes
- `90`: 90 minutes
- `120`: 120 minutes

**Meeting Types**:
- `video`: Video call session
- `audio`: Audio-only session
- `in_person`: In-person meeting
- `chat`: Text-based chat session

**Response**: `201 Created`
```json
{
  "id": "meeting_789",
  "title": "Weekly Therapy Session",
  "description": "Regular therapy session to discuss anxiety management",
  "startTime": "2024-01-15T14:00:00.000Z",
  "duration": 60,
  "status": "SCHEDULED",
  "meetingType": "video",
  "meetingUrl": null,
  "clientId": "client_123",
  "therapistId": "therapist_456",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "client": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "therapist": {
    "user": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    }
  }
}
```

**Validation Rules**:
- Must have existing client-therapist relationship
- No scheduling conflicts with existing meetings
- Therapist must be available at requested time
- Valid time format and duration

**Error Responses**:
- `400 Bad Request`: Invalid time slot, conflicts, or validation errors
- `403 Forbidden`: No relationship with therapist
- `404 Not Found`: Therapist not found

### Get Meetings
Retrieve all meetings for the current user.

**Endpoint**: `GET /booking/meetings`

**Response**: `200 OK`
```json
[
  {
    "id": "meeting_789",
    "title": "Weekly Therapy Session",
    "description": "Regular therapy session to discuss anxiety management",
    "startTime": "2024-01-15T14:00:00.000Z",
    "duration": 60,
    "status": "SCHEDULED",
    "meetingType": "video",
    "meetingUrl": null,
    "clientId": "client_123",
    "therapistId": "therapist_456",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "client": {
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    },
    "therapist": {
      "user": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com"
      }
    }
  }
]
```

**Meeting Status Values**:
- `SCHEDULED`: Meeting is scheduled but not confirmed
- `CONFIRMED`: Meeting is confirmed by both parties
- `COMPLETED`: Meeting has been completed
- `CANCELLED`: Meeting was cancelled
- `NO_SHOW`: Participant didn't attend

### Get Single Meeting
Retrieve details of a specific meeting.

**Endpoint**: `GET /booking/meetings/:id`

**Response**: `200 OK`
```json
{
  "id": "meeting_789",
  "title": "Weekly Therapy Session",
  "description": "Regular therapy session to discuss anxiety management",
  "startTime": "2024-01-15T14:00:00.000Z",
  "duration": 60,
  "status": "SCHEDULED",
  "meetingType": "video",
  "meetingUrl": null,
  "clientId": "client_123",
  "therapistId": "therapist_456",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "client": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "therapist": {
    "user": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Meeting not found
- `403 Forbidden`: No access to this meeting

### Update Meeting
Update an existing meeting (reschedule, change details, update status).

**Endpoint**: `PUT /booking/meetings/:id`

**Request Body**:
```json
{
  "title": "Updated Therapy Session",
  "description": "Focus on stress management techniques",
  "startTime": "2024-01-15T15:00:00.000Z",
  "duration": 90,
  "status": "CONFIRMED",
  "meetingType": "video"
}
```

**Response**: `200 OK`
```json
{
  "id": "meeting_789",
  "title": "Updated Therapy Session",
  "description": "Focus on stress management techniques",
  "startTime": "2024-01-15T15:00:00.000Z",
  "duration": 90,
  "status": "CONFIRMED",
  "meetingType": "video",
  "meetingUrl": null,
  "clientId": "client_123",
  "therapistId": "therapist_456",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:30:00.000Z",
  "client": {...},
  "therapist": {...}
}
```

**Restrictions**:
- Cannot update completed or cancelled meetings
- Rescheduling triggers validation of new time slot
- Status changes trigger appropriate events

**Error Responses**:
- `400 Bad Request`: Cannot update completed/cancelled meetings
- `403 Forbidden`: No access to this meeting

### Cancel Meeting
Cancel an existing meeting.

**Endpoint**: `DELETE /booking/meetings/:id/cancel`

**Response**: `200 OK`
```json
{
  "id": "meeting_789",
  "title": "Weekly Therapy Session",
  "description": "Regular therapy session to discuss anxiety management",
  "startTime": "2024-01-15T14:00:00.000Z",
  "duration": 60,
  "status": "CANCELLED",
  "meetingType": "video",
  "meetingUrl": null,
  "clientId": "client_123",
  "therapistId": "therapist_456",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:45:00.000Z",
  "client": {...},
  "therapist": {...}
}
```

**Features**:
- Calculates cancellation notice time
- Publishes cancellation events for notifications
- Cannot cancel already completed meetings

**Error Responses**:
- `400 Bad Request`: Meeting already cancelled or completed
- `403 Forbidden`: No access to this meeting

---

## ⏰ Availability Management

### Create Availability Slot
Create a new availability slot (therapists only).

**Endpoint**: `POST /booking/availability`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "notes": "Available for regular sessions"
}
```

**Day of Week Values**:
- `0`: Sunday
- `1`: Monday
- `2`: Tuesday
- `3`: Wednesday
- `4`: Thursday
- `5`: Friday
- `6`: Saturday

**Time Format**: `HH:MM` (24-hour format)

**Response**: `201 Created`
```json
{
  "id": "avail_123",
  "therapistId": "therapist_456",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true,
  "notes": "Available for regular sessions",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Validation Rules**:
- No overlapping time slots for the same day
- Start time must be before end time
- Valid time format (HH:MM)
- Only therapists can create availability

**Error Responses**:
- `400 Bad Request`: Invalid time format or overlapping slots
- `401 Unauthorized`: Only therapists can manage availability

### Get Availability
Get all availability slots for the current therapist.

**Endpoint**: `GET /booking/availability`

**Response**: `200 OK`
```json
[
  {
    "id": "avail_123",
    "therapistId": "therapist_456",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true,
    "notes": "Available for regular sessions",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "avail_124",
    "therapistId": "therapist_456",
    "dayOfWeek": 2,
    "startTime": "10:00",
    "endTime": "16:00",
    "isAvailable": true,
    "notes": "Tuesday availability",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### Update Availability
Update an existing availability slot.

**Endpoint**: `PUT /booking/availability/:id`

**Request Body**:
```json
{
  "dayOfWeek": 1,
  "startTime": "10:00",
  "endTime": "16:00",
  "notes": "Updated availability hours",
  "isAvailable": true
}
```

**Response**: `200 OK`
```json
{
  "id": "avail_123",
  "therapistId": "therapist_456",
  "dayOfWeek": 1,
  "startTime": "10:00",
  "endTime": "16:00",
  "isAvailable": true,
  "notes": "Updated availability hours",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:30:00.000Z"
}
```

### Delete Availability
Delete an availability slot.

**Endpoint**: `DELETE /booking/availability/:id`

**Response**: `200 OK`
```json
{
  "success": true
}
```

**Error Responses**:
- `404 Not Found`: Availability slot not found
- `403 Forbidden`: Can only delete own availability slots

---

## 🎯 Available Time Slots

### Get Available Slots
Get available booking slots for a specific therapist and date.

**Endpoint**: `GET /booking/slots`

**Query Parameters**:
- `therapistId`: Therapist user ID (required)
- `date`: Date in YYYY-MM-DD format (required)

**Example**: `GET /booking/slots?therapistId=therapist_456&date=2024-01-15`

**Response**: `200 OK`
```json
[
  {
    "startTime": "2024-01-15T09:00:00.000Z",
    "availableDurations": [
      {
        "id": "30",
        "name": "30 minutes",
        "duration": 30
      },
      {
        "id": "60",
        "name": "60 minutes",
        "duration": 60
      },
      {
        "id": "90",
        "name": "90 minutes",
        "duration": 90
      }
    ]
  },
  {
    "startTime": "2024-01-15T09:30:00.000Z",
    "availableDurations": [
      {
        "id": "30",
        "name": "30 minutes",
        "duration": 30
      },
      {
        "id": "60",
        "name": "60 minutes",
        "duration": 60
      }
    ]
  },
  {
    "startTime": "2024-01-15T10:00:00.000Z",
    "availableDurations": [
      {
        "id": "30",
        "name": "30 minutes",
        "duration": 30
      }
    ]
  }
]
```

**Features**:
- 30-minute slot intervals
- Considers existing bookings and conflicts
- Returns available durations for each slot
- Validates against therapist availability
- Excludes conflicting time periods

**Empty Response**: Returns `[]` if no slots available

---

## 📊 Data Models

### MeetingCreateDto
```typescript
{
  title?: string;                // Optional meeting title
  description?: string;          // Optional meeting description
  startTime: string;             // ISO date string
  duration: 30 | 60 | 90 | 120;  // Duration in minutes
  status?: MeetingStatus;        // Optional initial status
  meetingType?: string;          // 'video', 'audio', 'in_person', 'chat'
  therapistId: string;           // Therapist user ID
}
```

### MeetingUpdateDto
```typescript
{
  title?: string;                // Updated meeting title
  description?: string;          // Updated description
  startTime?: string;            // New start time (ISO string)
  duration?: 30 | 60 | 90 | 120; // New duration
  status?: MeetingStatus;        // New status
  meetingType?: string;          // New meeting type
  therapistId?: string;          // Change therapist (if allowed)
}
```

### TherapistAvailabilityCreateDto
```typescript
{
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 6=Saturday
  startTime: string;             // Time in HH:MM format
  endTime: string;               // Time in HH:MM format
  notes?: string;                // Optional notes
}
```

### TherapistAvailabilityUpdateDto
```typescript
{
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime?: string;            // Time in HH:MM format
  endTime?: string;              // Time in HH:MM format
  notes?: string;                // Optional notes
  isAvailable?: boolean;         // Enable/disable availability
}
```

### MeetingStatus Enum
```typescript
enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',     // Initial booking state
  CONFIRMED = 'CONFIRMED',     // Both parties confirmed
  COMPLETED = 'COMPLETED',     // Session completed
  CANCELLED = 'CANCELLED',     // Session cancelled
  NO_SHOW = 'NO_SHOW'         // Participant didn't attend
}
```

---

## 🔄 Events Published

The booking service publishes events for downstream processing:

### AppointmentBookedEvent
```typescript
{
  appointmentId: string;
  clientId: string;
  therapistId: string;
  startTime: Date;
  meetingType: 'video' | 'audio' | 'in_person' | 'chat';
  duration: number;
  title: string;
  description?: string;
  isInitialConsultation: boolean;
}
```

### AppointmentRescheduledEvent
```typescript
{
  appointmentId: string;
  clientId: string;
  therapistId: string;
  rescheduledBy: string;
  originalStartTime: Date;
  newStartTime: Date;
  rescheduleReason: string;
}
```

### AppointmentCancelledEvent
```typescript
{
  appointmentId: string;
  clientId: string;
  therapistId: string;
  cancelledBy: string;
  cancellationReason: string;
  originalStartTime: Date;
  cancelledAt: Date;
  cancellationNotice: number; // Hours of notice
}
```

### AppointmentCompletedEvent
```typescript
{
  appointmentId: string;
  clientId: string;
  therapistId: string;
  completedAt: Date;
  duration: number;
  sessionNotes: string;
  attendanceStatus: 'ATTENDED' | 'NO_SHOW';
}
```

---

## 🛡️ Security Features

### Role-Based Access
- **Clients**: Can book sessions with assigned therapists only
- **Therapists**: Can manage their own availability and sessions
- **Validation**: Verifies client-therapist relationships before booking

### Conflict Prevention
- **Double-Booking Prevention**: Checks both client and therapist schedules
- **Availability Validation**: Ensures therapist is available at requested time
- **Time Slot Validation**: Prevents overlapping appointments

### Data Validation
- **Time Format Validation**: Ensures proper HH:MM format
- **Duration Validation**: Only allows predefined durations
- **Date Validation**: Prevents booking in the past
- **Business Rules**: Enforces scheduling business logic

---

## 🧪 Testing

### Unit Tests
```bash
npm run test booking.service.spec.ts
npm run test booking.controller.spec.ts
```

### Integration Tests
```bash
npm run test:e2e -- --grep "Booking"
```

### Test Scenarios
```typescript
// Test booking creation
const bookingData = {
  startTime: '2024-01-15T14:00:00.000Z',
  duration: 60,
  therapistId: 'therapist_456'
};

// Test conflict detection
const conflictingBooking = {
  startTime: '2024-01-15T14:30:00.000Z',
  duration: 60,
  therapistId: 'therapist_456'
};

// Test availability creation
const availabilityData = {
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '17:00'
};
```

---

## 🚀 Frontend Integration

### React Hook Example
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useBooking() {
  const { getToken } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const bookMeeting = async (meetingData) => {
    const token = await getToken();
    const response = await fetch('/api/booking/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });
    
    if (response.ok) {
      const newMeeting = await response.json();
      setMeetings(prev => [...prev, newMeeting]);
      return newMeeting;
    }
    throw new Error('Failed to book meeting');
  };
  
  const getAvailableSlots = async (therapistId, date) => {
    const token = await getToken();
    const response = await fetch(
      `/api/booking/slots?therapistId=${therapistId}&date=${date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (response.ok) {
      const slots = await response.json();
      setAvailableSlots(slots);
      return slots;
    }
    throw new Error('Failed to fetch available slots');
  };
  
  const cancelMeeting = async (meetingId) => {
    const token = await getToken();
    const response = await fetch(`/api/booking/meetings/${meetingId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      setMeetings(prev => 
        prev.map(meeting => 
          meeting.id === meetingId 
            ? { ...meeting, status: 'CANCELLED' }
            : meeting
        )
      );
      return true;
    }
    throw new Error('Failed to cancel meeting');
  };
  
  return {
    meetings,
    availableSlots,
    bookMeeting,
    getAvailableSlots,
    cancelMeeting,
  };
}
```

### Booking Calendar Component
```typescript
import React, { useState, useEffect } from 'react';
import { useBooking } from './useBooking';

export function BookingCalendar({ therapistId }: { therapistId: string }) {
  const { availableSlots, getAvailableSlots, bookMeeting } = useBooking();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  
  useEffect(() => {
    if (therapistId && selectedDate) {
      getAvailableSlots(therapistId, selectedDate);
    }
  }, [therapistId, selectedDate]);
  
  const handleBooking = async () => {
    if (selectedSlot) {
      try {
        await bookMeeting({
          startTime: selectedSlot.startTime,
          duration: selectedDuration,
          therapistId: therapistId,
          meetingType: 'video'
        });
        alert('Meeting booked successfully!');
      } catch (error) {
        alert('Failed to book meeting');
      }
    }
  };
  
  return (
    <div className="booking-calendar">
      <div className="date-picker">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="available-slots">
        <h3>Available Time Slots</h3>
        {availableSlots.map((slot, index) => (
          <div key={index} className="time-slot">
            <button
              onClick={() => setSelectedSlot(slot)}
              className={selectedSlot === slot ? 'selected' : ''}
            >
              {new Date(slot.startTime).toLocaleTimeString()}
            </button>
            
            {selectedSlot === slot && (
              <div className="duration-picker">
                <label>Duration:</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                >
                  {slot.availableDurations.map(duration => (
                    <option key={duration.id} value={duration.duration}>
                      {duration.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={handleBooking}
        disabled={!selectedSlot}
        className="book-button"
      >
        Book Session
      </button>
    </div>
  );
}
```

### Availability Manager (Therapist)
```typescript
import React, { useState, useEffect } from 'react';

export function AvailabilityManager() {
  const [availability, setAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });
  
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];
  
  const addAvailability = async () => {
    try {
      const response = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlot),
      });
      
      if (response.ok) {
        const slot = await response.json();
        setAvailability(prev => [...prev, slot]);
        setNewSlot({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          notes: ''
        });
      }
    } catch (error) {
      alert('Failed to add availability');
    }
  };
  
  return (
    <div className="availability-manager">
      <h2>Manage Availability</h2>
      
      <div className="add-availability">
        <h3>Add New Availability</h3>
        <select
          value={newSlot.dayOfWeek}
          onChange={(e) => setNewSlot(prev => ({
            ...prev,
            dayOfWeek: Number(e.target.value)
          }))}
        >
          {daysOfWeek.map((day, index) => (
            <option key={index} value={index}>
              {day}
            </option>
          ))}
        </select>
        
        <input
          type="time"
          value={newSlot.startTime}
          onChange={(e) => setNewSlot(prev => ({
            ...prev,
            startTime: e.target.value
          }))}
        />
        
        <input
          type="time"
          value={newSlot.endTime}
          onChange={(e) => setNewSlot(prev => ({
            ...prev,
            endTime: e.target.value
          }))}
        />
        
        <button onClick={addAvailability}>
          Add Availability
        </button>
      </div>
      
      <div className="current-availability">
        <h3>Current Availability</h3>
        {availability.map(slot => (
          <div key={slot.id} className="availability-slot">
            <span>{daysOfWeek[slot.dayOfWeek]}</span>
            <span>{slot.startTime} - {slot.endTime}</span>
            <button onClick={() => deleteAvailability(slot.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📈 Performance Considerations

### Database Optimization
- **Indexed Queries**: Efficient lookups for availability and conflicts
- **Batch Operations**: Minimize database calls for slot calculations
- **Query Optimization**: Smart filtering for availability checks

### Caching Strategy
- **Available Slots**: Cache computed slots for popular date ranges
- **Availability**: Cache therapist availability patterns
- **Conflict Checks**: Optimize repeated conflict validations

### Real-time Updates
- **Event Broadcasting**: Notify participants of booking changes
- **Slot Availability**: Real-time updates when slots become unavailable
- **Calendar Sync**: Integration with external calendar systems

---

## 🆘 Troubleshooting

### Common Issues

#### Booking Creation Fails
**Cause**: Scheduling conflicts or missing relationship
**Solution**: Check client-therapist relationship and existing bookings

#### Availability Overlap Error
**Cause**: New availability slot overlaps with existing slot
**Solution**: Check existing availability for the same day

#### Time Format Validation
**Cause**: Incorrect time format
**Solution**: Use HH:MM format (e.g., "09:00", "14:30")

#### Meeting Update Restrictions
**Cause**: Attempting to update completed/cancelled meeting
**Solution**: Check meeting status before updates

### Debug Commands
```bash
# Check meeting conflicts
curl -X POST http://localhost:5000/api/booking/meetings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"startTime": "2024-01-15T14:00:00.000Z", "duration": 60, "therapistId": "therapist_456"}'

# Get available slots
curl "http://localhost:5000/api/booking/slots?therapistId=therapist_456&date=2024-01-15" \
  -H "Authorization: Bearer <token>"

# Check therapist availability
curl http://localhost:5000/api/booking/availability \
  -H "Authorization: Bearer <token>"
```

---

## 📚 Related Documentation

- [Authentication API](../auth/README.md)
- [Therapist Management API](../therapist/README.md)
- [Client Management API](../client/README.md)
- [Notifications API](../notifications/README.md)
- [Calendar Integration Guide](../../guides/calendar-integration.md)