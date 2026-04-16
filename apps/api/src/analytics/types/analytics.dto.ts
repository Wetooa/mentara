export interface PlatformAnalyticsQueryDto {
  dateFrom?: string;
  dateTo?: string;
  includeDetails?: boolean;
}

export interface TherapistAnalyticsQueryDto {
  therapistId?: string;
  dateFrom?: string;
  dateTo?: string;
  includeDetails?: boolean;
}

export interface ClientAnalyticsQueryDto {
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  includeDetails?: boolean;
}