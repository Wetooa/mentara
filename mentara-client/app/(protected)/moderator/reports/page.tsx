"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  MessageSquare,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

// Mock data for reports
const mockReports = [
  {
    id: "1",
    type: "content",
    contentType: "post",
    reportedBy: {
      name: "Sarah Johnson",
      id: "user_1"
    },
    target: {
      id: "post_1",
      title: "Discussion about therapy techniques",
      author: "Dr. Smith"
    },
    reason: "Inappropriate content",
    description: "This post contains misleading medical advice",
    status: "pending",
    priority: "high",
    createdAt: "2025-01-17T10:30:00Z",
    reviewedBy: null,
    category: "medical_misinformation"
  },
  {
    id: "2",
    type: "user",
    reportedBy: {
      name: "Mike Chen",
      id: "user_2"
    },
    target: {
      id: "user_3",
      name: "Alex Wilson",
      email: "alex@example.com"
    },
    reason: "Harassment",
    description: "This user has been sending inappropriate messages",
    status: "under_review",
    priority: "high",
    createdAt: "2025-01-17T09:15:00Z",
    reviewedBy: "Jane Doe",
    category: "harassment"
  },
  {
    id: "3",
    type: "content",
    contentType: "comment",
    reportedBy: {
      name: "Lisa Park",
      id: "user_4"
    },
    target: {
      id: "comment_1",
      title: "Reply to therapy session feedback",
      author: "Anonymous User"
    },
    reason: "Spam",
    description: "Repeated promotional content",
    status: "resolved",
    priority: "medium",
    createdAt: "2025-01-16T16:45:00Z",
    reviewedBy: "John Admin",
    category: "spam"
  }
];

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800"
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  under_review: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-orange-100 text-orange-800"
};

export default function ModeratorReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Filter reports based on search and filters
  const filteredReports = useMemo(() => {
    return mockReports.filter(report => {
      const matchesSearch = 
        report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ('title' in report.target && report.target.title?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
      const matchesType = typeFilter === "all" || report.type === typeFilter;
      const matchesTab = activeTab === "all" || report.status === activeTab;

      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesTab;
    });
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockReports.length;
    const pending = mockReports.filter(r => r.status === "pending").length;
    const underReview = mockReports.filter(r => r.status === "under_review").length;
    const resolved = mockReports.filter(r => r.status === "resolved").length;
    const highPriority = mockReports.filter(r => r.priority === "high").length;

    return { total, pending, underReview, resolved, highPriority };
  }, []);

  const handleReportAction = (reportId: string, action: string) => {
    console.log(`Performing ${action} on report ${reportId}`);
    // TODO: Implement actual report actions
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <MessageSquare className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Content Reports</h1>
          <p className="text-gray-600">Review and manage reported content and users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
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
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
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
              placeholder="Search reports..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Reports Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getReportTypeIcon(report.type)}
                              <span className="font-medium">{report.reason}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {report.description}
                            </p>
                            {'title' in report.target && (
                              <p className="text-xs text-gray-500">
                                Target: {report.target.title}
                              </p>
                            )}
                            {'name' in report.target && (
                              <p className="text-xs text-gray-500">
                                User: {report.target.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{report.reportedBy.name}</p>
                            <p className="text-xs text-gray-500">ID: {report.reportedBy.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${priorityColors[report.priority as keyof typeof priorityColors]} capitalize`}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[report.status as keyof typeof statusColors]} capitalize`}>
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.createdAt)}
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
                              <DropdownMenuItem onClick={() => handleReportAction(report.id, 'view')}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {report.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleReportAction(report.id, 'review')}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Start Review
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReportAction(report.id, 'resolve')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Resolve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReportAction(report.id, 'dismiss')}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Dismiss
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No reports found</h3>
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