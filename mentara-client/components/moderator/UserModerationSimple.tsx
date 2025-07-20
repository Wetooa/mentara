"use client";

import React from "react";
import Image from "next/image";
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
  Eye,
  Ban,
  AlertTriangle,
  UserCheck,
  Filter,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import type { User, UserModerationParams } from "@/types/api";

interface UserModerationProps {
  users?: User[];
  total?: number;
  isLoading?: boolean;
  filters?: UserModerationParams;
  searchTerm?: string;
  onFiltersChange?: (filters: Partial<UserModerationParams>) => void;
  onSearchChange?: (term: string) => void;
  onRefresh?: () => void;
  onViewUser?: (user: User) => void;
  onAction?: (user: User, action: 'suspend' | 'warn' | 'clearFlags') => void;
  className?: string;
}

export function UserModeration({
  users = [],
  total = 0,
  isLoading = false,
  filters = {},
  searchTerm = "",
  onFiltersChange,
  onSearchChange,
  onRefresh,
  onViewUser,
  onAction,
  className,
}: UserModerationProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Suspended
          </Badge>
        );
      case "flagged":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Flagged
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      client: "bg-blue-100 text-blue-800",
      therapist: "bg-purple-100 text-purple-800",
      moderator: "bg-orange-100 text-orange-800",
      admin: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {role}
      </Badge>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                User Moderation
              </CardTitle>
              <CardDescription>
                Manage flagged users and violations ({total} users)
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-[250px]"
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
              value={filters.status || 'all'} 
              onValueChange={(value: string) => onFiltersChange?.({ status: value === 'all' ? undefined : value as 'active' | 'suspended' | 'flagged' })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.role || 'all'} 
              onValueChange={(value: string) => onFiltersChange?.({ role: value === 'all' ? undefined : value as 'client' | 'therapist' | 'moderator' | 'admin' })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="therapist">Therapists</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No flagged users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={user.avatarUrl || `/icons/user-avatar.png`}
                          alt={user.firstName || 'User'}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{user.firstName || 'Unknown User'}</span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge((user as { status?: string }).status || 'active')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {(user as { reportCount?: number }).reportCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt || '')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewUser?.(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(user as { status?: string }).status !== 'suspended' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-amber-600 hover:bg-amber-50"
                              onClick={() => onAction?.(user, 'warn')}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => onAction?.(user, 'suspend')}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(user as { status?: string }).status === 'flagged' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => onAction?.(user, 'clearFlags')}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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