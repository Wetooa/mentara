"use client";

import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  // User,
  Eye,
  Ban,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  Filter,
  RefreshCw,
  History,
} from "lucide-react";
import { format } from "date-fns";
import { useFlaggedUsers, useModerateUser, useUserModerationHistory } from "@/hooks/moderator/useModerator";
import type { User as UserType, UserModerationParams } from "@/types/api";

interface UserModerationTableProps {
  className?: string;
}

export function UserModerationTable({ className }: UserModerationTableProps) {
  const [filters, setFilters] = useState<UserModerationParams>({
    status: 'flagged',
    limit: 20,
    offset: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'warn' | 'flag' | 'clearFlags' | null>(null);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<number>(7);

  const { 
    data: usersData, 
    isLoading, 
    refetch 
  } = useFlaggedUsers({
    ...filters,
    search: searchTerm,
  });

  const { 
    data: userHistory,
    isLoading: historyLoading 
  } = useUserModerationHistory(selectedUser?.id || null);

  const moderateUser = useModerateUser();

  const users = usersData?.users || [];
  const total = usersData?.total || 0;

  const handleUserAction = (
    user: UserType,
    action: 'suspend' | 'warn' | 'flag' | 'clearFlags'
  ) => {
    setSelectedUser(user);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    await moderateUser.mutateAsync({
      userId: selectedUser.id,
      data: {
        action: actionType,
        reason,
        duration: actionType === 'suspend' ? duration : undefined,
      },
    });

    setActionDialogOpen(false);
    setReason("");
    setDuration(7);
    setSelectedUser(null);
    setActionType(null);
  };

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
                onClick={() => refetch()}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              value={filters.status} 
              onValueChange={(value: string) => setFilters({...filters, status: value as 'all' | 'active' | 'suspended' | 'flagged'})}
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
              value={filters.role} 
              onValueChange={(value: string) => setFilters({...filters, role: value as 'all' | 'client' | 'therapist' | 'moderator' | 'admin'})}
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
                          onClick={() => {
                            setSelectedUser(user);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(user as { status?: string }).status !== 'suspended' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-amber-600 hover:bg-amber-50"
                              onClick={() => handleUserAction(user, 'warn')}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleUserAction(user, 'suspend')}
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
                            onClick={() => handleUserAction(user, 'clearFlags')}
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

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Details & Moderation History</DialogTitle>
            <DialogDescription>
              View detailed information and moderation history
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={selectedUser.avatarUrl || `/icons/user-avatar.png`}
                    alt={selectedUser.firstName || 'User'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.firstName || 'Unknown User'}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {getStatusBadge((selectedUser as { status?: string }).status || 'active')}
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                    <p className="text-sm mt-1">{selectedUser.id}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">Reports Against</h3>
                    <p className="text-xl font-bold mt-1 text-red-600">
                      {(selectedUser as { reportCount?: number }).reportCount || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <p className="text-sm mt-1">{formatDate(selectedUser.createdAt || '')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Moderation History */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Moderation History
                </h3>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading history...
                  </div>
                ) : userHistory?.actions && userHistory.actions.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userHistory.actions.map((action: { type: string; timestamp: string; moderator: string; reason?: string }, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={action.action === 'suspend' ? 'destructive' : 'secondary'}>
                              {action.action}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              by {action.moderatorName}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(action.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-2">{action.reason}</p>
                        {action.note && (
                          <p className="text-xs text-gray-500 mt-1">Note: {action.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No moderation history found</p>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between">
                <div className="flex items-center gap-2">
                  {(selectedUser as { status?: string }).status !== 'suspended' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => {
                          setDetailsOpen(false);
                          handleUserAction(selectedUser, 'warn');
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Warn User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setDetailsOpen(false);
                          handleUserAction(selectedUser, 'suspend');
                        }}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Suspend User
                      </Button>
                    </>
                  )}
                  {(selectedUser as { status?: string }).status === 'flagged' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => {
                        setDetailsOpen(false);
                        handleUserAction(selectedUser, 'clearFlags');
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Clear Flags
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'suspend' && 'Suspend User'}
              {actionType === 'warn' && 'Warn User'}
              {actionType === 'flag' && 'Flag User'}
              {actionType === 'clearFlags' && 'Clear User Flags'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'suspend' && 'This will temporarily suspend the user from the platform.'}
              {actionType === 'warn' && 'This will send a warning to the user about their behavior.'}
              {actionType === 'flag' && 'This will flag the user for further monitoring.'}
              {actionType === 'clearFlags' && 'This will remove all flags from the user account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {actionType === 'suspend' && (
              <div>
                <label className="text-sm font-medium">Suspension Duration (days)</label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Enter the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={!reason.trim() || moderateUser.isPending}
              className={
                actionType === 'suspend'
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === 'warn'
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {moderateUser.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Confirm {actionType}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}