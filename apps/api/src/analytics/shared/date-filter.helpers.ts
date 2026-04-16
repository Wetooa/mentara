/**
 * Date filter helpers for analytics queries
 * Provides consistent date filtering across all analytics services
 */

export interface DateRange {
  gte?: Date;
  lte?: Date;
}

/**
 * Build a Prisma date filter from start and end dates
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @param field - Database field name (default: 'createdAt')
 * @returns Prisma where clause object for date filtering
 */
export function buildDateFilter(
  startDate?: Date,
  endDate?: Date,
  field: string = 'createdAt',
): Record<string, any> {
  const dateFilter: DateRange = {};

  if (startDate) {
    dateFilter.gte = startDate;
  }
  if (endDate) {
    dateFilter.lte = endDate;
  }

  return Object.keys(dateFilter).length > 0 ? { [field]: dateFilter } : {};
}

/**
 * Build date filter for nested relations
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @param field - Database field name (default: 'createdAt')
 * @returns Prisma where clause object for nested date filtering
 */
export function buildNestedDateFilter(
  startDate?: Date,
  endDate?: Date,
  field: string = 'createdAt',
): Record<string, any> {
  if (!startDate && !endDate) {
    return {};
  }

  return {
    [field]: {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    },
  };
}

/**
 * Get default date range (last 30 days)
 */
export function getDefaultDateRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Get date range for common periods
 */
export function getDateRangeForPeriod(
  period: 'today' | 'week' | 'month' | 'year',
): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (period) {
    case 'today':
      start = new Date(end);
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { start, end };
}
