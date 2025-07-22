"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  User, 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { fadeDown } from "@/lib/animations";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";


// Using AuditLog type from local API types via service
interface DisplayAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  role?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success?: boolean;
  details?: string | Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: string;
  category?: string;
}

// Action types for audit log filtering (can be uncommented when needed)
// const ACTION_TYPES = {
//   CREATE: 'create',
//   UPDATE: 'update',
//   DELETE: 'delete',
//   LOGIN: 'login',
//   LOGOUT: 'logout',
//   APPROVE: 'approve',
//   REJECT: 'reject',
//   SUSPEND: 'suspend',
//   ACTIVATE: 'activate',
//   EXPORT: 'export',
//   IMPORT: 'import',
// } as const;

// Resource types for audit log filtering (can be uncommented when needed)
// const RESOURCE_TYPES = {
//   USER: 'user',
//   THERAPIST: 'therapist',
//   APPLICATION: 'application',
//   SESSION: 'session',
//   POST: 'post',
//   COMMENT: 'comment',
//   REPORT: 'report',
//   SYSTEM: 'system',
// } as const;

export default function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [successFilter, setSuccessFilter] = useState<string>("all");
  const [userFilter] = useState<string>("all"); // setUserFilter can be added when user filtering UI is implemented
  const [dateRange, setDateRange] = useState<string>("7");

  const api = useApi();

  // Calculate date range for filtering
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - parseInt(dateRange));

  // Fetch audit logs with proper React Query patterns
  const { 
    data: auditLogs, 
    isPending: isLoading,
    isError: hasError,
    // error, // Can be uncommented for error handling if needed
    refetch 
  } = useQuery({
    queryKey: ['auditLogs', 'list', {
      action: actionFilter === "all" ? undefined : actionFilter,
      resource: resourceFilter === "all" ? undefined : resourceFilter,
      success: successFilter === "all" ? undefined : (successFilter === "success"),
      userId: userFilter === "all" ? undefined : userFilter,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }],
    queryFn: () => api.auditLogs.getList({
      action: actionFilter === "all" ? undefined : actionFilter,
      resource: resourceFilter === "all" ? undefined : resourceFilter,
      success: successFilter === "all" ? undefined : (successFilter === "success"),
      userId: userFilter === "all" ? undefined : userFilter,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Mock data for demonstration - simplified structure
  const mockAuditLogs: DisplayAuditLog[] = [
    {
      id: "1",
      action: "login",
      resource: "user",
      resourceId: "user-123",
      userId: "admin-1",
      userEmail: "admin@mentara.com",
      userRole: "admin",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: new Date().toISOString(),
      success: true,
    },
    {
      id: "2",
      action: "approve",
      resource: "application",
      resourceId: "app-456",
      userId: "admin-1",
      userEmail: "admin@mentara.com",
      userRole: "admin",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      success: true,
    },
    {
      id: "3",
      action: "suspend",
      resource: "user",
      resourceId: "user-789",
      userId: "admin-2",
      userEmail: "moderator@mentara.com",
      userRole: "moderator",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      success: true,
    },
    {
      id: "4",
      action: "delete",
      resource: "post",
      resourceId: "post-321",
      userId: "admin-1",
      userEmail: "admin@mentara.com",
      userRole: "admin",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      success: true,
    },
    {
      id: "5",
      action: "create",
      resource: "user",
      resourceId: "user-654",
      userId: "admin-1",
      userEmail: "admin@mentara.com",
      userRole: "admin",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      success: true,
    },
  ];

  // Use real data if available, otherwise use mock data
  const logs: DisplayAuditLog[] = auditLogs?.logs || mockAuditLogs;

  // Filter logs based on search query
  const filteredLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    if (!searchQuery) return logs;

    const searchLower = searchQuery.toLowerCase();
    return logs.filter((log) =>
      log.action.toLowerCase().includes(searchLower) ||
      log.resource.toLowerCase().includes(searchLower) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchLower)) ||
      log.ipAddress.toLowerCase().includes(searchLower)
    );
  }, [logs, searchQuery]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suspend':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'activate':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-purple-100 text-purple-800';
      case 'therapist':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "MMM dd, yyyy 'at' HH:mm:ss");
    } catch {
      return timestamp;
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting audit logs...');
  };

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">
              Monitor system activity and user actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
                <SelectItem value="activate">Activate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={successFilter} onValueChange={setSuccessFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24h</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Logs</p>
                  <p className="text-2xl font-bold">{filteredLogs.length}</p>
                </div>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {logs.length > 0 ? Math.round((logs.filter(l => l.success === true).length / logs.length) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Failed Actions</p>
                  <p className="text-2xl font-bold">{logs.filter(l => l.success === false).length}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unique Users</p>
                  <p className="text-2xl font-bold">{new Set(logs.map(l => l.userId)).size}</p>
                </div>
                <User className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : hasError ? (
              <div className="p-6 text-center text-red-500">
                Failed to load audit logs. Please try again.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium capitalize">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{log.resource}</span>
                          {log.resourceId && (
                            <Badge variant="outline" className="text-xs">
                              {log.resourceId.slice(0, 8)}...
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.userEmail || 'Unknown User'}</div>
                          {(log.userRole || log.role) && (
                            <Badge className={getRoleColor(log.userRole || log.role || 'unknown')} variant="secondary">
                              {log.userRole || log.role}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.success === true ? 'success' : (log.success === false ? 'failure' : 'pending'))}>
                          {log.success === true ? 'success' : (log.success === false ? 'failure' : 'pending')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{log.ipAddress}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredLogs.length === 0 && !isLoading && (
              <div className="p-6 text-center text-gray-500">
                {searchQuery || actionFilter !== "all" || resourceFilter !== "all" || successFilter !== "all"
                  ? "No audit logs match your filters."
                  : "No audit logs found."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}