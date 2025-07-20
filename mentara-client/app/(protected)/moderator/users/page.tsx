"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  UserX,
  UserCheck,
  Mail,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Ban,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

// Mock data for users
const mockUsers = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    role: "client",
    status: "active",
    joinedAt: "2024-01-15T10:30:00Z",
    lastActive: "2025-01-17T09:15:00Z",
    reportCount: 0,
    communityPosts: 12,
    avatarUrl: "/avatars/sarah.jpg",
    verificationStatus: "verified",
    riskLevel: "low"
  },
  {
    id: "2",
    firstName: "Dr. Michael",
    lastName: "Chen",
    email: "m.chen@therapy.com",
    role: "therapist",
    status: "active",
    joinedAt: "2023-08-22T14:20:00Z",
    lastActive: "2025-01-17T11:45:00Z",
    reportCount: 1,
    communityPosts: 45,
    avatarUrl: "/avatars/michael.jpg",
    verificationStatus: "verified",
    riskLevel: "low"
  },
  {
    id: "3",
    firstName: "Alex",
    lastName: "Wilson",
    email: "alex@example.com",
    role: "client",
    status: "suspended",
    joinedAt: "2024-03-10T16:45:00Z",
    lastActive: "2025-01-10T20:30:00Z",
    reportCount: 3,
    communityPosts: 8,
    avatarUrl: "/avatars/alex.jpg",
    verificationStatus: "pending",
    riskLevel: "high"
  },
  {
    id: "4",
    firstName: "Lisa",
    lastName: "Park",
    email: "lisa.park@email.com",
    role: "client",
    status: "active",
    joinedAt: "2024-11-05T12:15:00Z",
    lastActive: "2025-01-16T18:20:00Z",
    reportCount: 0,
    communityPosts: 25,
    avatarUrl: "/avatars/lisa.jpg",
    verificationStatus: "verified",
    riskLevel: "low"
  },
  {
    id: "5",
    firstName: "John",
    lastName: "Admin",
    email: "john@mentara.com",
    role: "admin",
    status: "active",
    joinedAt: "2023-01-01T00:00:00Z",
    lastActive: "2025-01-17T12:00:00Z",
    reportCount: 0,
    communityPosts: 5,
    avatarUrl: "/avatars/john.jpg",
    verificationStatus: "verified",
    riskLevel: "low"
  }
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  banned: "bg-gray-100 text-gray-800"
};

const roleColors = {
  client: "bg-blue-100 text-blue-800",
  therapist: "bg-purple-100 text-purple-800",
  admin: "bg-orange-100 text-orange-800",
  moderator: "bg-green-100 text-green-800"
};

const riskColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

export default function ModeratorUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    type: string;
    user: typeof mockUsers[0] | null;
  }>({
    isOpen: false,
    type: "",
    user: null
  });
  const [actionReason, setActionReason] = useState("");

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesRisk = riskFilter === "all" || user.riskLevel === riskFilter;

      return matchesSearch && matchesStatus && matchesRole && matchesRisk;
    });
  }, [searchQuery, statusFilter, roleFilter, riskFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockUsers.length;
    const active = mockUsers.filter(u => u.status === "active").length;
    const suspended = mockUsers.filter(u => u.status === "suspended").length;
    const highRisk = mockUsers.filter(u => u.riskLevel === "high").length;
    const unverified = mockUsers.filter(u => u.verificationStatus === "pending").length;

    return { total, active, suspended, highRisk, unverified };
  }, []);

  const handleUserAction = (user: typeof mockUsers[0], action: string) => {
    setActionDialog({
      isOpen: true,
      type: action,
      user
    });
  };

  const executeUserAction = () => {
    if (!actionDialog.user) return;
    
    console.log(`Performing ${actionDialog.type} on user ${actionDialog.user.id}`, {
      reason: actionReason
    });
    
    // TODO: Implement actual user actions
    setActionDialog({ isOpen: false, type: "", user: null });
    setActionReason("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'suspended':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'therapist':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <UserCheck className="h-4 w-4" />;
      case 'moderator':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Monitor and manage platform users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
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
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unverified</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unverified}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
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
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="therapist">Therapist</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
          </SelectContent>
        </Select>

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {user.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <Badge className={`${roleColors[user.role as keyof typeof roleColors]} capitalize`}>
                          {user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <Badge className={`${statusColors[user.status as keyof typeof statusColors]} capitalize`}>
                          {user.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${riskColors[user.riskLevel as keyof typeof riskColors]} capitalize`}>
                        {user.riskLevel} Risk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        {user.reportCount > 0 ? (
                          <Badge variant="destructive">{user.reportCount}</Badge>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.joinedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDate(user.lastActive)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user, 'suspend')}
                              className="text-orange-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          {user.status === 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user, 'activate')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleUserAction(user, 'ban')}
                            className="text-red-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                <p className="mt-2 text-gray-600">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.isOpen} onOpenChange={(open) => 
        setActionDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'suspend' && 'Suspend User'}
              {actionDialog.type === 'activate' && 'Activate User'}
              {actionDialog.type === 'ban' && 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.user && (
                <>
                  You are about to {actionDialog.type} {actionDialog.user.firstName} {actionDialog.user.lastName}.
                  This action will affect their access to the platform.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason (required)</label>
              <Textarea
                placeholder="Please provide a reason for this action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ isOpen: false, type: "", user: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={executeUserAction}
              disabled={!actionReason.trim()}
              variant={actionDialog.type === 'ban' ? 'destructive' : 'default'}
            >
              Confirm {actionDialog.type}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}