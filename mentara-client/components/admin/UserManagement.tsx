"use client";

import React, { useState } from "react";
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
  DialogFooter,
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
  Search,
  User,
  Eye,
  Ban,
  ShieldAlert,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for users
const mockUsers = [
  {
    id: "user123",
    name: "John Doe",
    email: "john.doe@example.com",
    dateJoined: "2024-10-15T09:00:00Z",
    status: "active",
    role: "patient",
    lastActive: "2025-05-01T14:22:00Z",
    postCount: 24,
    commentCount: 45,
    reportsFiled: 2,
    reportsAgainst: 0,
    avatar: "https://ui-avatars.com/api/?name=John+Doe",
  },
  {
    id: "user456",
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    dateJoined: "2024-11-23T11:30:00Z",
    status: "active",
    role: "patient",
    lastActive: "2025-05-02T10:45:00Z",
    postCount: 12,
    commentCount: 28,
    reportsFiled: 0,
    reportsAgainst: 1,
    avatar: "https://ui-avatars.com/api/?name=Sarah+Miller",
  },
  {
    id: "user789",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    dateJoined: "2024-09-05T08:15:00Z",
    status: "banned",
    role: "patient",
    lastActive: "2025-04-15T09:30:00Z",
    postCount: 7,
    commentCount: 19,
    reportsFiled: 1,
    reportsAgainst: 5,
    avatar: "https://ui-avatars.com/api/?name=Michael+Brown",
  },
  {
    id: "therapist123",
    name: "Dr. Lisa Johnson",
    email: "lisa.johnson@mentara.com",
    dateJoined: "2024-08-12T10:00:00Z",
    status: "active",
    role: "therapist",
    lastActive: "2025-05-02T16:20:00Z",
    postCount: 31,
    commentCount: 87,
    reportsFiled: 0,
    reportsAgainst: 0,
    avatar: "https://ui-avatars.com/api/?name=Lisa+Johnson",
  },
  {
    id: "user555",
    name: "Kevin Smith",
    email: "kevin.smith@example.com",
    dateJoined: "2025-01-07T13:45:00Z",
    status: "restricted",
    role: "patient",
    lastActive: "2025-04-28T11:15:00Z",
    postCount: 3,
    commentCount: 9,
    reportsFiled: 0,
    reportsAgainst: 2,
    avatar: "https://ui-avatars.com/api/?name=Kevin+Smith",
  },
];

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "ban" | "restrict" | "unrestrict" | "unban" | null
  >(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleUserAction = (
    type: "ban" | "restrict" | "unrestrict" | "unban"
  ) => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUser || !actionType) return;

    // In a real application, you would make API calls to perform these actions
    const updatedUsers = [...users];
    const index = updatedUsers.findIndex((u) => u.id === selectedUser.id);

    if (index !== -1) {
      let newStatus = selectedUser.status;

      switch (actionType) {
        case "ban":
          newStatus = "banned";
          break;
        case "restrict":
          newStatus = "restricted";
          break;
        case "unrestrict":
          newStatus = "active";
          break;
        case "unban":
          newStatus = "active";
          break;
      }

      updatedUsers[index] = {
        ...updatedUsers[index],
        status: newStatus,
      };

      // Update the selected user as well
      setSelectedUser({
        ...selectedUser,
        status: newStatus,
      });

      setUsers(updatedUsers);
    }

    setActionDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "banned":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Banned
          </Badge>
        );
      case "restricted":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Restricted
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage users and their access to the platform
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="pl-10 w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-600">Total Users</p>
            <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-600">Banned Users</p>
            <h3 className="text-2xl font-bold mt-1">
              {users.filter((u) => u.status === "banned").length}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-600">
              Restricted Users
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {users.filter((u) => u.status === "restricted").length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all users on the platform
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Filters:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="therapist">Therapists</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>{user.name}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.dateJoined)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setDetailsOpen(true);
                      }}
                      className="mr-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information and manage user access
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                  <p className="mt-1">{selectedUser.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="mt-1 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date Joined
                  </h3>
                  <p className="mt-1">{formatDate(selectedUser.dateJoined)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Active
                  </h3>
                  <p className="mt-1">
                    {formatDateTime(selectedUser.lastActive)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">Posts</h3>
                    <p className="text-xl font-bold mt-1">
                      {selectedUser.postCount}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Comments
                    </h3>
                    <p className="text-xl font-bold mt-1">
                      {selectedUser.commentCount}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Reports Filed
                    </h3>
                    <p className="text-xl font-bold mt-1">
                      {selectedUser.reportsFiled}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Reports Against
                    </h3>
                    <p className="text-xl font-bold mt-1">
                      {selectedUser.reportsAgainst}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="border-t pt-4 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    User Actions
                  </h3>
                  <div className="flex space-x-2">
                    {selectedUser.status === "active" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => handleUserAction("restrict")}
                        >
                          <ShieldAlert className="h-4 w-4 mr-1" />
                          Restrict User
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleUserAction("ban")}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban User
                        </Button>
                      </>
                    ) : selectedUser.status === "restricted" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleUserAction("unrestrict")}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Remove Restriction
                      </Button>
                    ) : selectedUser.status === "banned" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleUserAction("unban")}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Unban User
                      </Button>
                    ) : null}
                  </div>
                </div>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "ban" && "Ban User"}
              {actionType === "restrict" && "Restrict User"}
              {actionType === "unrestrict" && "Remove Restriction"}
              {actionType === "unban" && "Unban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "ban" &&
                "This will permanently ban the user from using the platform. Their account will be deactivated and they will not be able to log in."}
              {actionType === "restrict" &&
                "This will restrict the user's ability to post or comment for 30 days."}
              {actionType === "unrestrict" &&
                "This will remove all restrictions from the user's account, allowing them to post and comment normally."}
              {actionType === "unban" &&
                "This will unban the user and reactivate their account, allowing them to use the platform again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "ban"
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === "restrict"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : actionType === "unrestrict" || actionType === "unban"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
