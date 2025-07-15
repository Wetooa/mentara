"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  History,
  Eye,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import type { AuditLog, AuditLogParams } from "@/types/api";

interface AuditLogsProps {
  logs?: AuditLog[];
  total?: number;
  stats?: {
    totalLogs: number;
    todayLogs: number;
    criticalEvents: number;
  };
  isLoading?: boolean;
  filters?: AuditLogParams;
  searchTerm?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  onFiltersChange?: (filters: Partial<AuditLogParams>) => void;
  onSearchChange?: (term: string) => void;
  onDateRangeChange?: (range: { startDate: string; endDate: string }) => void;
  onRefresh?: () => void;
  onViewLog?: (log: AuditLog) => void;
  onExport?: () => void;
  className?: string;
}

export function AuditLogs({
  logs = [],
  total = 0,
  stats = { totalLogs: 0, todayLogs: 0, criticalEvents: 0 },
  isLoading = false,
  filters = {},
  searchTerm = "",
  dateRange = { startDate: "", endDate: "" },
  onFiltersChange,
  onSearchChange,
  onDateRangeChange,
  onRefresh,
  onViewLog,
  onExport,
  className,
}: AuditLogsProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm:ss a");
    } catch {
      return dateString;
    }
  };

  const getActionBadge = (action: string) => {
    const actionTypes = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-purple-100 text-purple-800",
      LOGOUT: "bg-gray-100 text-gray-800",
      MODERATE: "bg-orange-100 text-orange-800",
      SUSPEND: "bg-red-100 text-red-800",
      APPROVE: "bg-green-100 text-green-800",
      REJECT: "bg-yellow-100 text-yellow-800",
    };

    const colorClass = actionTypes[action as keyof typeof actionTypes] || "bg-gray-100 text-gray-800";
    
    return (
      <Badge className={colorClass}>
        {action}
      </Badge>
    );
  };

  const getEntityBadge = (entityType: string) => {
    const entityTypes = {
      User: "bg-blue-100 text-blue-800",
      Post: "bg-green-100 text-green-800",
      Comment: "bg-purple-100 text-purple-800",
      Community: "bg-orange-100 text-orange-800",
      Session: "bg-pink-100 text-pink-800",
      Report: "bg-red-100 text-red-800",
    };

    const colorClass = entityTypes[entityType as keyof typeof entityTypes] || "bg-gray-100 text-gray-800";
    
    return (
      <Badge variant="outline" className={colorClass}>
        {entityType}
      </Badge>
    );
  };

  return (
    <div className={className}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Logs</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalLogs.toLocaleString()}</h3>
              </div>
              <History className="h-8 w-8 text-blue-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Today&apos;s Logs</p>
                <h3 className="text-2xl font-bold mt-1">{stats.todayLogs.toLocaleString()}</h3>
              </div>
              <Calendar className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Events</p>
                <h3 className="text-2xl font-bold mt-1">{stats.criticalEvents.toLocaleString()}</h3>
              </div>
              <Shield className="h-8 w-8 text-red-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                System activity and security events ({total.toLocaleString()} logs)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user ID..."
                  className="pl-10 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Filters:</span>
            
            <Select 
              value={filters.action || 'all'} 
              onValueChange={(value) => onFiltersChange?.({ action: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="MODERATE">Moderate</SelectItem>
                <SelectItem value="SUSPEND">Suspend</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.entityType || 'all'} 
              onValueChange={(value) => onFiltersChange?.({ entityType: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Post">Post</SelectItem>
                <SelectItem value="Comment">Comment</SelectItem>
                <SelectItem value="Community">Community</SelectItem>
                <SelectItem value="Session">Session</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-[150px]"
              value={dateRange.startDate}
              onChange={(e) => onDateRangeChange?.({ ...dateRange, startDate: e.target.value })}
            />
            
            <Input
              type="date"
              className="w-[150px]"
              value={dateRange.endDate}
              onChange={(e) => onDateRangeChange?.({ ...dateRange, endDate: e.target.value })}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityBadge(log.entityType)}
                        <span className="text-sm text-gray-500">
                          {log.entityId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{log.userId || 'System'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate">
                        {log.details || 'No details available'}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {(log as { ipAddress?: string }).ipAddress || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewLog?.(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}