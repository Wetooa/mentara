/**
 * Meeting Response Transformer
 * Centralizes response transformation logic for consistency
 */

export class MeetingResponseTransformer {
  /**
   * Transform meeting object to frontend-compatible format
   */
  static transform(meeting: any) {
    return {
      ...meeting,
      dateTime: meeting.startTime, // Frontend expects dateTime
      therapistName: this.getTherapistName(meeting.therapist),
      clientName: this.getClientName(meeting.client),
    };
  }

  /**
   * Transform multiple meetings
   */
  static transformMany(meetings: any[]) {
    return meetings.map((meeting) => this.transform(meeting));
  }

  /**
   * Get formatted therapist name
   */
  private static getTherapistName(therapist: any): string {
    if (!therapist?.user) {
      return 'Unknown Therapist';
    }
    return `${therapist.user.firstName} ${therapist.user.lastName}`.trim();
  }

  /**
   * Get formatted client name
   */
  private static getClientName(client: any): string {
    if (!client?.user) {
      return 'Unknown Client';
    }
    return `${client.user.firstName} ${client.user.lastName}`.trim();
  }
}
