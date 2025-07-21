"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
  Activity, 
  AlertTriangle, 
  FileText, 
  Users, 
  Calendar,
  Shield,
  BarChart3
} from "lucide-react";
import { useAdminDashboard, useAdminSystemStats } from "@/hooks/admin";
import { fadeDown } from "@/lib/animations";

// Local interface for dashboard stats that handles all possible response structures
interface DashboardStats {
  totalUsers?: number;
  activeUsers?: number;
  totalTherapists?: number;
  totalSessions?: number;
  activeReports?: number;
  contentPublished?: number;
  activeSessions?: number;
  // Handle nested overview structure from API
  overview?: {
    totalUsers?: number;
    totalClients?: number;
    totalTherapists?: number;
    pendingApplications?: number;
    totalCommunities?: number;
    totalPosts?: number;
    totalSessions?: number;
  };
}

export default function AdminDashboardPage() {
  // Fetch real dashboard data with proper React Query patterns
  const { 
    data: dashboardData, 
    isPending: dashboardPending, 
    isError: dashboardError
  } = useAdminDashboard();
  
  const { 
    data: systemStats, 
    isPending: statsPending,
    isError: statsError
  } = useAdminSystemStats();

  // Use isPending instead of isLoading for initial loading state
  const isLoading = dashboardPending || statsPending;
  const hasError = dashboardError || statsError;
  // const error = dashboardErrorData || statsErrorData; // Can be used for error handling

  // Fallback to mock data if backend data is unavailable
  const mockStats = {
    totalUsers: 5231,
    activeUsers: 4876,
    totalTherapists: 342,
    totalSessions: 12450,
    activeReports: 27,
    contentPublished: 423,
    activeSessions: 189,
  };

  const stats: DashboardStats = (dashboardData || systemStats || mockStats) as DashboardStats;

  const dashboardMetrics = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || stats.overview?.totalUsers?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      description: "Compared to last month",
      icon: <Users className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Active Users",
      value: stats.activeUsers?.toLocaleString() || "0",
      change: "+8.5%",
      trend: "up",
      description: "Active in last 30 days",
      icon: <Activity className="h-5 w-5 text-green-500" />
    },
    {
      title: "Total Therapists",
      value: stats.totalTherapists?.toLocaleString() || stats.overview?.totalTherapists?.toLocaleString() || "0",
      change: "+5.2%",
      trend: "up",
      description: "Approved therapists",
      icon: <Shield className="h-5 w-5 text-purple-500" />
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions?.toLocaleString() || stats.overview?.totalSessions?.toLocaleString() || "0",
      change: "+15.3%",
      trend: "up",
      description: "All time sessions",
      icon: <Calendar className="h-5 w-5 text-orange-500" />
    },
    {
      title: "Active Reports",
      value: stats.activeReports?.toLocaleString() || "0",
      change: "+5",
      trend: "up",
      description: "Unresolved reports",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
    },
    {
      title: "Content Published",
      value: stats.contentPublished?.toLocaleString() || "0",
      change: "+42",
      trend: "up",
      description: "Last 30 days",
      icon: <FileText className="h-5 w-5 text-green-500" />
    }
  ];

  return (
    <motion.div
      variants={fadeDown}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to the Mentara admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : hasError ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-center text-red-500 space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <p>Failed to load dashboard data. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          dashboardMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                    <div className="flex items-baseline mt-1">
                      <h3 className="text-2xl font-bold">{metric.value}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 ${metric.trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}
                      >
                        {metric.change}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-md">{metric.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/users"
            className={buttonVariants({ variant: "outline", className: "justify-start" })}
          >
            <Users className="mr-2 h-4 w-4 text-blue-600" />
            Manage Users
          </Link>
          <Link 
            href="/admin/therapists"
            className={buttonVariants({ variant: "outline", className: "justify-start" })}
          >
            <Shield className="mr-2 h-4 w-4 text-purple-600" />
            Therapist Applications
          </Link>
          <Link 
            href="/admin/analytics"
            className={buttonVariants({ variant: "outline", className: "justify-start" })}
          >
            <BarChart3 className="mr-2 h-4 w-4 text-green-600" />
            Analytics
          </Link>
          <Link 
            href="/admin/audit-logs"
            className={buttonVariants({ variant: "outline", className: "justify-start" })}
          >
            <FileText className="mr-2 h-4 w-4 text-orange-600" />
            Audit Logs
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start space-x-4 py-2 border-b border-gray-100 last:border-0">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  {item % 3 === 0 ? <AlertTriangle className="h-4 w-4" /> : 
                   item % 2 === 0 ? <Users className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {item % 3 === 0 ? "New report filed" : 
                     item % 2 === 0 ? "New user registered" : "New post published"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(Date.now() - item * 3600000).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
