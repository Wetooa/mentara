import {
  type TherapistListResponse,
  type TherapistApplicationDetailsResponse,
  type TherapistActionResponse,
  type TherapistApplicationMetricsResponse,
} from '../types';

/**
 * Transformation functions for Admin module responses
 * Converts service layer data to proper API response DTOs
 */
export class AdminResponseTransformer {
  /**
   * Transform service response to TherapistListResponse
   */
  static transformTherapistList(serviceResponse: any): TherapistListResponse {
    return {
      therapists: serviceResponse.applications || [],
      total: serviceResponse.summary?.filtered || 0,
      page: 1, // Default page since service doesn't provide pagination info
      limit: serviceResponse.applications?.length || 50,
    };
  }

  /**
   * Transform service response to TherapistApplicationDetailsResponse
   */
  static transformApplicationDetails(serviceResponse: any): TherapistApplicationDetailsResponse {
    const application = serviceResponse.application;
    return {
      id: application.userId || application.id,
      status: application.status,
      submittedAt: application.submissionDate?.toISOString() || application.createdAt?.toISOString(),
      user: application.user,
      application: application,
    };
  }

  /**
   * Transform service response to TherapistActionResponse
   */
  static transformActionResponse(serviceResponse: any, therapistId: string): TherapistActionResponse {
    return {
      success: serviceResponse.success || true,
      message: serviceResponse.message || 'Operation completed successfully',
      therapistId: therapistId,
    };
  }

  /**
   * Transform service response to TherapistApplicationMetricsResponse
   */
  static transformApplicationMetrics(serviceResponse: any): TherapistApplicationMetricsResponse {
    const summary = serviceResponse.summary || {};
    return {
      total: summary.totalApplications || 0,
      pending: summary.pendingApplications || 0,
      approved: summary.approvedApplications || 0,
      rejected: summary.rejectedApplications || 0,
      suspended: 0, // Service doesn't provide suspended count, defaulting to 0
    };
  }
}