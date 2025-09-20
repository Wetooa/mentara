"use client";

import React, { useState, useMemo } from "react";
import { Search, MoreHorizontal, UserCheck, UserX, Mail, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { motion } from "framer-motion";
import { fadeDown } from "@/lib/animations";
import { format } from "date-fns";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "therapist" | "moderator" | "admin";
  status: "active" | "suspended" | "pending";
  createdAt: string;
  lastActive: string;
  emailVerified: boolean;
  sessionCount?: number;
  profileComplete: boolean;
}

const USER_ROLES = {
  CLIENT: "client",
  THERAPIST: "therapist", 
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
} as const;

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "activate" | "delete" | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);

  // Use admin users hook for data fetching and mutations
  const {
    users,
    userStats,
    isLoading, // This hook already provides proper loading state
    error,
    suspendUser,
    activateUser,
    deleteUser,
    sendVerificationEmail,
    isUpdating,
  } = useAdminUsers({
    role: roleFilter === "all" ? undefined : roleFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    if (!searchQuery) return users;

    const searchLower = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  }, [users, searchQuery]);

  const handleUserAction = (user: User, action: "suspend" | "activate" | "delete") => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      switch (actionType) {
        case "suspend":
          await suspendUser(selectedUser.id);
          break;
        case "activate":
          await activateUser(selectedUser.id);
          break;
        case "delete":
          await deleteUser(selectedUser.id);
          break;
      }
    } finally {
      setShowActionDialog(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleResendVerification = async (userId: string) => {
    await sendVerificationEmail(userId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "moderator": return "bg-purple-100 text-purple-800";
      case "therapist": return "bg-blue-100 text-blue-800";
      case "client": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
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
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        </div>

        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Therapists</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.therapists}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.newThisMonth}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={USER_ROLES.CLIENT}>Client</SelectItem>
                <SelectItem value={USER_ROLES.THERAPIST}>Therapist</SelectItem>
                <SelectItem value={USER_ROLES.MODERATOR}>Moderator</SelectItem>
                <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={USER_STATUS.ACTIVE}>Active</SelectItem>
                <SelectItem value={USER_STATUS.SUSPENDED}>Suspended</SelectItem>
                <SelectItem value={USER_STATUS.PENDING}>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-500">Loading users...</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-500">Failed to load users. Please try again.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.lastActive)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                            >
                              View Profile
                            </DropdownMenuItem>
                            
                            {!user.emailVerified && (
                              <DropdownMenuItem 
                                onClick={() => handleResendVerification(user.id)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Verification
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {user.status === "active" ? (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user, "suspend")}
                                className="text-red-600"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user, "activate")}
                                className="text-green-600"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredUsers.length === 0 && !isLoading && (
              <div className="py-8 text-center text-gray-500">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                  ? "No users match your filters."
                  : "No users found."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Confirmation Dialog */}
        <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "suspend" && "Suspend User"}
                {actionType === "activate" && "Activate User"}
                {actionType === "delete" && "Delete User"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === "suspend" && selectedUser && 
                  `Are you sure you want to suspend ${selectedUser.firstName} ${selectedUser.lastName}? They will not be able to access their account until reactivated.`
                }
                {actionType === "activate" && selectedUser && 
                  `Are you sure you want to activate ${selectedUser.firstName} ${selectedUser.lastName}? They will regain full access to their account.`
                }
                {actionType === "delete" && selectedUser && 
                  `Are you sure you want to permanently delete ${selectedUser.firstName} ${selectedUser.lastName}? This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction}
                disabled={isUpdating}
                className={
                  actionType === "delete" || actionType === "suspend"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }
              >
                {isUpdating ? "Processing..." : 
                 actionType === "suspend" ? "Suspend" :
                 actionType === "activate" ? "Activate" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}