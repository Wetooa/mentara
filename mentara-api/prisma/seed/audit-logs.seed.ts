// Audit Logs Seed Module
// Handles creation of comprehensive audit trail data for admin review

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

// Admin action types for audit logging
const adminActionTypes = [
  'USER_CREATED',
  'USER_UPDATED', 
  'USER_DEACTIVATED',
  'USER_REACTIVATED',
  'THERAPIST_APPROVED',
  'THERAPIST_REJECTED',
  'THERAPIST_SUSPENDED',
  'CONTENT_MODERATED',
  'POST_REMOVED',
  'COMMENT_REMOVED',
  'USER_BANNED',
  'USER_UNBANNED',
  'ADMIN_LOGIN',
  'ADMIN_LOGOUT',
  'SYSTEM_SETTINGS_CHANGED',
  'BULK_USER_UPDATE',
  'DATA_EXPORT',
  'PASSWORD_RESET_ADMIN',
  'ROLE_CHANGED',
  'PERMISSIONS_UPDATED'
];

// User action types for system audit
const userActionTypes = [
  'USER_LOGIN',
  'USER_LOGOUT', 
  'PASSWORD_CHANGED',
  'PROFILE_UPDATED',
  'ASSESSMENT_COMPLETED',
  'THERAPIST_REQUESTED',
  'APPOINTMENT_BOOKED',
  'APPOINTMENT_CANCELLED',
  'MESSAGE_SENT',
  'WORKSHEET_SUBMITTED',
  'REVIEW_POSTED',
  'COMMUNITY_JOINED',
  'COMMUNITY_LEFT',
  'POST_CREATED',
  'COMMENT_POSTED',
  'FILE_UPLOADED',
  'NOTIFICATION_READ',
  'SETTINGS_CHANGED',
  'EMAIL_VERIFIED',
  'ACCOUNT_DEACTIVATED'
];

// System action types for infrastructure audit
const systemActionTypes = [
  'DATABASE_BACKUP',
  'SYSTEM_RESTART',
  'MIGRATION_EXECUTED',
  'SECURITY_SCAN',
  'PERFORMANCE_OPTIMIZATION',
  'ERROR_OCCURRED',
  'SERVICE_DOWN',
  'SERVICE_RESTORED',
  'RATE_LIMIT_EXCEEDED',
  'SECURITY_BREACH_DETECTED',
  'UNUSUAL_ACTIVITY_DETECTED',
  'DATA_INTEGRITY_CHECK',
  'CACHE_CLEARED',
  'CONFIG_UPDATED',
  'SSL_CERTIFICATE_RENEWED'
];

export async function seedAuditLogs(
  prisma: PrismaClient,
  users: any[],
  admins: any[]
) {
  console.log('📋 Creating comprehensive audit logs...');

  const auditLogs: any[] = [];
  const logCount = SEED_CONFIG.AUDIT_LOGS?.COUNT || 500;

  // Generate audit logs over the past year
  for (let i = 0; i < logCount; i++) {
    const logType = faker.helpers.arrayElement(['admin', 'user', 'system']);
    const timestamp = faker.date.past({ years: 1 });
    
    let actionType: string;
    let actorId: string | null = null;
    let targetId: string | null = null;
    let details: Record<string, any> = {};
    
    switch (logType) {
      case 'admin':
        actionType = faker.helpers.arrayElement(adminActionTypes);
        actorId = admins.length > 0 ? faker.helpers.arrayElement(admins).id : null;
        targetId = faker.helpers.arrayElement(users).id;
        details = generateAdminActionDetails(actionType);
        break;
        
      case 'user':
        actionType = faker.helpers.arrayElement(userActionTypes);
        actorId = faker.helpers.arrayElement(users).id;
        details = generateUserActionDetails(actionType);
        break;
        
      case 'system':
        actionType = faker.helpers.arrayElement(systemActionTypes);
        details = generateSystemActionDetails(actionType);
        break;
    }

    const auditLog = {
      id: faker.string.uuid(),
      action: actionType,
      actorType: logType.toUpperCase(),
      actorId,
      targetType: getTargetType(actionType),
      targetId,
      details: JSON.stringify(details),
      ipAddress: faker.internet.ipv4(),
      userAgent: faker.internet.userAgent(),
      success: faker.datatype.boolean(0.95), // 95% success rate
      errorMessage: faker.datatype.boolean(0.05) ? faker.hacker.phrase() : null,
      severity: getSeverity(actionType),
      category: getCategory(actionType),
      metadata: JSON.stringify(generateMetadata(actionType)),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    auditLogs.push(auditLog);
  }

  try {
    // Insert audit logs
    await prisma.auditLog.createMany({
      data: auditLogs,
      skipDuplicates: true
    });

    console.log(`✅ Successfully created ${auditLogs.length} audit log entries`);
    
    // Generate summary statistics
    generateAuditStatistics(auditLogs);
    
    return auditLogs;
  } catch (error) {
    console.error('❌ Failed to seed audit logs:', error);
    throw error;
  }
}

function generateAdminActionDetails(actionType: string): Record<string, any> {
  const baseDetails = {
    timestamp: new Date().toISOString(),
    adminLevel: faker.helpers.arrayElement(['super_admin', 'admin', 'moderator'])
  };

  switch (actionType) {
    case 'THERAPIST_APPROVED':
      return {
        ...baseDetails,
        therapistId: faker.string.uuid(),
        applicationId: faker.string.uuid(),
        reviewNotes: faker.lorem.sentence(),
        credentialsVerified: true,
        autoNotificationSent: true
      };
      
    case 'THERAPIST_REJECTED':
      return {
        ...baseDetails,
        therapistId: faker.string.uuid(),
        applicationId: faker.string.uuid(),
        rejectionReason: faker.helpers.arrayElement([
          'Insufficient credentials',
          'License verification failed',
          'Application incomplete',
          'Background check issues'
        ]),
        rejectionNotes: faker.lorem.paragraph()
      };
      
    case 'CONTENT_MODERATED':
      return {
        ...baseDetails,
        contentType: faker.helpers.arrayElement(['post', 'comment', 'message']),
        contentId: faker.string.uuid(),
        moderationAction: faker.helpers.arrayElement(['removed', 'flagged', 'warned']),
        violationType: faker.helpers.arrayElement(['spam', 'harassment', 'inappropriate', 'medical_advice']),
        details: faker.lorem.sentence()
      };
      
    case 'USER_DEACTIVATED':
      return {
        ...baseDetails,
        reason: faker.helpers.arrayElement(['Terms violation', 'User request', 'Security concern', 'Inactivity']),
        permanent: faker.datatype.boolean(0.2),
        notificationSent: true
      };
      
    default:
      return {
        ...baseDetails,
        description: `Admin performed ${actionType.toLowerCase().replace('_', ' ')}`
      };
  }
}

function generateUserActionDetails(actionType: string): Record<string, any> {
  const baseDetails = {
    timestamp: new Date().toISOString(),
    sessionId: faker.string.uuid()
  };

  switch (actionType) {
    case 'USER_LOGIN':
      return {
        ...baseDetails,
        loginMethod: faker.helpers.arrayElement(['email', 'google', 'microsoft']),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        location: `${faker.location.city()}, ${faker.location.country()}`
      };
      
    case 'ASSESSMENT_COMPLETED':
      return {
        ...baseDetails,
        assessmentType: faker.helpers.arrayElement(['PHQ-9', 'GAD-7', 'PCL-5']),
        score: faker.number.int({ min: 0, max: 27 }),
        duration: faker.number.int({ min: 300, max: 1800 }), // 5-30 minutes in seconds
        completionRate: faker.number.float({ min: 0.8, max: 1.0, multipleOf: 0.01 })
      };
      
    case 'APPOINTMENT_BOOKED':
      return {
        ...baseDetails,
        therapistId: faker.string.uuid(),
        appointmentDate: faker.date.future().toISOString(),
        duration: faker.helpers.arrayElement([30, 45, 60, 90]),
        appointmentType: faker.helpers.arrayElement(['initial', 'follow-up', 'crisis'])
      };
      
    case 'MESSAGE_SENT':
      return {
        ...baseDetails,
        conversationId: faker.string.uuid(),
        messageLength: faker.number.int({ min: 10, max: 500 }),
        hasAttachment: faker.datatype.boolean(0.2),
        encrypted: true
      };
      
    default:
      return {
        ...baseDetails,
        description: `User performed ${actionType.toLowerCase().replace('_', ' ')}`
      };
  }
}

function generateSystemActionDetails(actionType: string): Record<string, any> {
  const baseDetails = {
    timestamp: new Date().toISOString(),
    systemComponent: faker.helpers.arrayElement(['api', 'database', 'cache', 'file-storage', 'notification-service'])
  };

  switch (actionType) {
    case 'DATABASE_BACKUP':
      return {
        ...baseDetails,
        backupSize: `${faker.number.float({ min: 0.5, max: 10.0, multipleOf: 0.1 })}GB`,
        backupLocation: faker.system.filePath(),
        compressionRatio: faker.number.float({ min: 0.3, max: 0.8, multipleOf: 0.01 }),
        duration: `${faker.number.int({ min: 5, max: 120 })}min`
      };
      
    case 'SECURITY_BREACH_DETECTED':
      return {
        ...baseDetails,
        threatType: faker.helpers.arrayElement(['sql_injection', 'brute_force', 'ddos', 'malware']),
        severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
        sourceIp: faker.internet.ipv4(),
        blocked: true,
        investigationRequired: true
      };
      
    case 'PERFORMANCE_OPTIMIZATION':
      return {
        ...baseDetails,
        optimizationType: faker.helpers.arrayElement(['query', 'cache', 'index', 'memory']),
        performanceGain: `${faker.number.int({ min: 5, max: 50 })}%`,
        resourcesFreed: `${faker.number.float({ min: 0.1, max: 2.0, multipleOf: 0.1 })}GB`
      };
      
    case 'ERROR_OCCURRED':
      return {
        ...baseDetails,
        errorType: faker.helpers.arrayElement(['500', '503', '404', 'timeout', 'connection']),
        errorMessage: faker.hacker.phrase(),
        stackTrace: faker.lorem.lines(3),
        affectedUsers: faker.number.int({ min: 1, max: 100 }),
        resolution: faker.helpers.arrayElement(['auto-retry', 'manual-fix', 'escalated'])
      };
      
    default:
      return {
        ...baseDetails,
        description: `System performed ${actionType.toLowerCase().replace('_', ' ')}`
      };
  }
}

function getTargetType(actionType: string): string | null {
  if (actionType.includes('USER') || actionType.includes('THERAPIST')) return 'USER';
  if (actionType.includes('POST') || actionType.includes('COMMENT')) return 'CONTENT';
  if (actionType.includes('ASSESSMENT')) return 'ASSESSMENT';
  if (actionType.includes('APPOINTMENT')) return 'APPOINTMENT';
  if (actionType.includes('MESSAGE')) return 'MESSAGE';
  return null;
}

function getSeverity(actionType: string): string {
  if (actionType.includes('BREACH') || actionType.includes('CRITICAL')) return 'CRITICAL';
  if (actionType.includes('ERROR') || actionType.includes('FAILED')) return 'HIGH';
  if (actionType.includes('WARNING') || actionType.includes('SUSPICIOUS')) return 'MEDIUM';
  return 'LOW';
}

function getCategory(actionType: string): string {
  if (actionType.includes('LOGIN') || actionType.includes('AUTH')) return 'AUTHENTICATION';
  if (actionType.includes('USER') || actionType.includes('PROFILE')) return 'USER_MANAGEMENT';
  if (actionType.includes('THERAPIST') || actionType.includes('APPLICATION')) return 'THERAPIST_MANAGEMENT';
  if (actionType.includes('CONTENT') || actionType.includes('POST') || actionType.includes('COMMENT')) return 'CONTENT_MODERATION';
  if (actionType.includes('SYSTEM') || actionType.includes('DATABASE') || actionType.includes('BACKUP')) return 'SYSTEM_OPERATIONS';
  if (actionType.includes('SECURITY') || actionType.includes('BREACH')) return 'SECURITY';
  return 'GENERAL';
}

function generateMetadata(actionType: string): Record<string, any> {
  return {
    environment: 'production',
    version: faker.system.semver(),
    requestId: faker.string.uuid(),
    correlationId: faker.string.uuid(),
    source: faker.helpers.arrayElement(['web', 'mobile', 'api', 'system']),
    region: faker.helpers.arrayElement(['us-east-1', 'us-west-2', 'eu-west-1']),
    tags: faker.helpers.arrayElements(['audit', 'compliance', 'security', 'performance'], { min: 1, max: 3 })
  };
}

function generateAuditStatistics(auditLogs: any[]): void {
  const stats = {
    totalLogs: auditLogs.length,
    successRate: (auditLogs.filter(log => log.success).length / auditLogs.length * 100).toFixed(2),
    categoryCounts: {} as Record<string, number>,
    severityCounts: {} as Record<string, number>,
    actorTypeCounts: {} as Record<string, number>
  };

  // Calculate category distribution
  auditLogs.forEach(log => {
    stats.categoryCounts[log.category] = (stats.categoryCounts[log.category] || 0) + 1;
    stats.severityCounts[log.severity] = (stats.severityCounts[log.severity] || 0) + 1;
    stats.actorTypeCounts[log.actorType] = (stats.actorTypeCounts[log.actorType] || 0) + 1;
  });

  console.log(`📊 Audit Log Statistics:
  - Total Logs: ${stats.totalLogs}
  - Success Rate: ${stats.successRate}%
  - By Category: ${JSON.stringify(stats.categoryCounts, null, 2)}
  - By Severity: ${JSON.stringify(stats.severityCounts, null, 2)}
  - By Actor Type: ${JSON.stringify(stats.actorTypeCounts, null, 2)}`);
}