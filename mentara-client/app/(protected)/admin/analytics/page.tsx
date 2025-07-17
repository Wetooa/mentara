"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Activity, 
  Calendar,
  MessageCircle,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminSystemStats, useAdminUserGrowth, useAdminEngagement } from "@/hooks/admin";
import { fadeDown } from "@/lib/animations";
import { subDays } from "date-fns";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate date range for analytics
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(timeRange));

  // Fetch analytics data with proper React Query patterns
  const { 
    data: systemStats
  } = useAdminSystemStats();
  
  const { 
    data: userGrowth
  } = useAdminUserGrowth({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  
  const { 
    data: engagement
  } = useAdminEngagement({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Loading and error states (can be used for conditional rendering if needed)
  // const isLoading = statsPending || growthPending || engagementPending;
  // const hasError = statsError || growthError || engagementError;

  // Mock data for demonstration (replace with real data when available)
  const mockSystemStats = {
    totalUsers: 5231,
    activeUsers: 4876,
    totalTherapists: 342,
    activeTherapists: 298,
    totalSessions: 12450,
    completedSessions: 11230,
    totalRevenue: 185420,
    averageSessionDuration: 52,
    userRetentionRate: 87.5,
    therapistUtilizationRate: 72.3,
  };

  const mockUserGrowth = {
    newUsers: [
      { date: "2024-01-01", count: 45 },
      { date: "2024-01-02", count: 52 },
      { date: "2024-01-03", count: 38 },
      { date: "2024-01-04", count: 61 },
      { date: "2024-01-05", count: 44 },
    ],
    growthRate: 12.5,
    totalGrowth: 847,
  };

  const mockEngagement = {
    averageSessionsPerUser: 2.4,
    averageMessagesPerDay: 1847,
    worksheetCompletionRate: 68.2,
    communityPostsPerDay: 124,
    averageRating: 4.7,
    responseTime: 8.2,
  };

  const stats = systemStats || mockSystemStats;
  const growth = userGrowth || mockUserGrowth;
  const engagementData = engagement || mockEngagement;

  const overviewMetrics = [
    {
      title: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      change: `+${growth.growthRate}%`,
      trend: "up",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers?.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up", 
      icon: <UserCheck className="h-5 w-5 text-green-500" />,
      description: "Active in last 30 days",
    },
    {
      title: "Total Therapists",
      value: stats.totalTherapists?.toLocaleString() || "0",
      change: "+5.1%",
      trend: "up",
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      description: "Approved therapists",
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions?.toLocaleString() || "0",
      change: "+15.3%",
      trend: "up",
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      description: "All time sessions",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.totalRevenue?.toLocaleString() || "0"}`,
      change: "+22.8%",
      trend: "up",
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "This month's revenue",
    },
    {
      title: "Avg Session Duration",
      value: `${stats.averageSessionDuration || 0} min`,
      change: "+3.2%",
      trend: "up",
      icon: <LineChart className="h-5 w-5 text-blue-600" />,
      description: "Average session length",
    },
  ];

  const engagementMetrics = [
    {
      title: "User Retention Rate",
      value: `${stats.userRetentionRate || 0}%`,
      description: "30-day retention",
      color: "text-green-600",
    },
    {
      title: "Therapist Utilization",
      value: `${stats.therapistUtilizationRate || 0}%`,
      description: "Active therapist ratio",
      color: "text-blue-600",
    },
    {
      title: "Worksheet Completion",
      value: `${engagementData.worksheetCompletionRate || 0}%`,
      description: "Assignment completion rate",
      color: "text-purple-600",
    },
    {
      title: "Average Rating",
      value: `${engagementData.averageRating || 0}/5.0`,
      description: "Therapist ratings",
      color: "text-yellow-600",
    },
  ];

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
            <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Platform insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overviewMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    {metric.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={metric.trend === "up" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}
                      >
                        {metric.change}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Engagement Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {engagementMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${metric.color}`}>
                        {metric.value}
                      </div>
                      <div className="text-sm font-medium mt-2">{metric.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {metric.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Activity Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    User Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">New users ({timeRange} days)</span>
                      <span className="font-semibold">{growth.totalGrowth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Growth rate</span>
                      <Badge className="bg-green-100 text-green-800">+{growth.growthRate}%</Badge>
                    </div>
                    <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Chart placeholder</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Daily messages</span>
                      <span className="font-semibold">{engagementData.averageMessagesPerDay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Community posts/day</span>
                      <span className="font-semibold">{engagementData.communityPostsPerDay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg response time</span>
                      <Badge variant="outline">{engagementData.responseTime}h</Badge>
                    </div>
                    <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
                      <PieChart className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Chart placeholder</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">User Analytics</h3>
              <p className="text-muted-foreground">
                Detailed user analytics and demographics coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Session Analytics</h3>
              <p className="text-muted-foreground">
                Session metrics and therapy analytics coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Engagement Analytics</h3>
              <p className="text-muted-foreground">
                User engagement and interaction metrics coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Revenue Analytics</h3>
              <p className="text-muted-foreground">
                Financial metrics and revenue analytics coming soon...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}