"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  History,
  Search,
  Filter,
  Download,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: "1",
    action: "USER_SUSPENDED",
    resource: "User",
    resourceId: "user_123",
    actor: {
      id: "mod_1",
      name: "Jane Moderator",
      email: "jane@mentara.com",
      role: "moderator"
    },
    target: {
      id: "user_123",
      name: "Alex Wilson",
      email: "alex@example.com"
    },
    details: {
      reason: "Inappropriate behavior in community posts",
      duration: "7 days"
    },
    timestamp: "2025-01-17T10:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    success: true,
    category: "USER_MANAGEMENT",
    severity: "medium"
  },
  {
    id: "2", 
    action: "CONTENT_DELETED",
    resource: "Post",
    resourceId: "post_456",
    actor: {
      id: "mod_2", 
      name: "John Moderator",
      email: "john@mentara.com",
      role: "moderator"
    },
    target: {
      id: "post_456",
      title: "Controversial therapy discussion",
      author: "Dr. Smith"
    },
    details: {
      reason: "Violation of community guidelines",
      reportId: "report_789"
    },
    timestamp: "2025-01-17T09:15:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)",
    success: true,
    category: "CONTENT_MODERATION",
    severity: "high"
  },
  {
    id: "3",
    action: "USER_LOGIN",
    resource: "Session",
    resourceId: "session_789",
    actor: {
      id: "user_456",
      name: "Sarah Johnson", 
      email: "sarah@example.com",
      role: "client"
    },
    target: null,
    details: {
      method: "email_password",
      deviceType: "desktop"
    },
    timestamp: "2025-01-17T08:45:00Z",
    ipAddress: "203.0.113.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    success: true,
    category: "AUTHENTICATION",
    severity: "low"
  },
  {
    id: "4",
    action: "THERAPIST_APPROVED",
    resource: "TherapistApplication",
    resourceId: "app_321",
    actor: {
      id: "admin_1",
      name: "Admin User",
      email: "admin@mentara.com",
      role: "admin"
    },
    target: {
      id: "therapist_321",
      name: "Dr. Emily Chen",
      email: "emily@therapy.com"
    },
    details: {
      applicationId: "app_321",
      licenseVerified: true
    },
    timestamp: "2025-01-16T16:20:00Z",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)",
    success: true,
    category: "APPLICATION_REVIEW",
    severity: "medium"
  },
  {
    id: "5",
    action: "LOGIN_FAILED",
    resource: "Session",
    resourceId: "failed_session_123",
    actor: {
      id: "unknown",
      name: "Unknown User",
      email: "suspicious@example.com",
      role: "unknown"
    },
    target: null,
    details: {
      reason: "Invalid credentials",
      attemptCount: 5
    },
    timestamp: "2025-01-17T07:30:00Z",
    ipAddress: "198.51.100.42",
    userAgent: "suspicious-bot/1.0",
    success: false,
    category: "SECURITY",
    severity: "high"
  }
];

const actionColors = {
  USER_SUSPENDED: "bg-orange-100 text-orange-800",
  USER_ACTIVATED: "bg-green-100 text-green-800",
  CONTENT_DELETED: "bg-red-100 text-red-800",
  CONTENT_APPROVED: "bg-green-100 text-green-800",
  USER_LOGIN: "bg-blue-100 text-blue-800",
  LOGIN_FAILED: "bg-red-100 text-red-800",
  THERAPIST_APPROVED: "bg-purple-100 text-purple-800",
  THERAPIST_REJECTED: "bg-orange-100 text-orange-800"
};

const severityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-red-100 text-red-800"
};

const categoryColors = {
  USER_MANAGEMENT: "bg-blue-100 text-blue-800",
  CONTENT_MODERATION: "bg-purple-100 text-purple-800",
  AUTHENTICATION: "bg-green-100 text-green-800",
  APPLICATION_REVIEW: "bg-orange-100 text-orange-800",
  SECURITY: "bg-red-100 text-red-800"
};

export default function ModeratorAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [activeTab, setActiveTab] = useState("all");

  // Filter audit logs based on search and filters
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.target?.name && log.target.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAction = actionFilter === "all" || log.action === actionFilter;
      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
      const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
      
      // Simple date filtering (in real implementation, would parse dates properly)
      const matchesDate = dateRange === "all" || 
        (dateRange === "today" && new Date(log.timestamp).toDateString() === new Date().toDateString());

      const matchesTab = activeTab === "all" || 
        (activeTab === "security" && log.category === "SECURITY") ||
        (activeTab === "moderation" && log.category === "CONTENT_MODERATION") ||
        (activeTab === "user_actions" && log.category === "USER_MANAGEMENT");

      return matchesSearch && matchesAction && matchesCategory && matchesSeverity && matchesDate && matchesTab;
    });
  }, [searchQuery, actionFilter, categoryFilter, severityFilter, dateRange, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayLogs = mockAuditLogs.filter(log => 
      new Date(log.timestamp).toDateString() === today
    );
    
    const total = todayLogs.length;
    const securityEvents = todayLogs.filter(log => log.category === "SECURITY").length;
    const moderationActions = todayLogs.filter(log => log.category === "CONTENT_MODERATION").length;
    const failedActions = todayLogs.filter(log => !log.success).length;
    const highSeverity = todayLogs.filter(log => log.severity === "high").length;

    return { total, securityEvents, moderationActions, failedActions, highSeverity };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_SUSPENDED':
      case 'USER_ACTIVATED':
        return <User className="h-4 w-4" />;
      case 'CONTENT_DELETED':
      case 'CONTENT_APPROVED':
        return <Shield className="h-4 w-4" />;
      case 'USER_LOGIN':
        return <CheckCircle className="h-4 w-4" />;
      case 'LOGIN_FAILED':
        return <XCircle className="h-4 w-4" />;
      case 'THERAPIST_APPROVED':
      case 'THERAPIST_REJECTED':
        return <Activity className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track system activity and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
        variants={itemVariants}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Activity</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-red-600">{stats.securityEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moderation Actions</p>
                <p className="text-2xl font-bold text-purple-600">{stats.moderationActions}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Actions</p>
                <p className="text-2xl font-bold text-orange-600">{stats.failedActions}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-red-600">{stats.highSeverity}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4"
        variants={itemVariants}
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="USER_MANAGEMENT">User Management</SelectItem>
            <SelectItem value="CONTENT_MODERATION">Content Moderation</SelectItem>
            <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            <SelectItem value="APPLICATION_REVIEW">Application Review</SelectItem>
            <SelectItem value="SECURITY">Security</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Audit Logs Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="security">Security Events</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="user_actions">User Actions</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <div>
                              <Badge className={`${actionColors[log.action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}`}>
                                {log.action.replace('_', ' ')}
                              </Badge>
                              {log.details && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {log.details.reason || Object.values(log.details)[0]}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {log.actor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{log.actor.name}</p>
                              <p className="text-xs text-gray-500">{log.actor.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.target ? (
                            <div>
                              <p className="font-medium text-sm">
                                {log.target.name || log.target.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.resource} ({log.resourceId.slice(-6)})
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${categoryColors[log.category as keyof typeof categoryColors]}`}>
                            {log.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${severityColors[log.severity as keyof typeof severityColors]} capitalize`}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredLogs.length === 0 && (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No audit logs found</h3>
                    <p className="mt-2 text-gray-600">
                      Try adjusting your search criteria or filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}