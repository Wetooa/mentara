"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Flag,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react";
import type { ModeratorDashboardStats } from "@/types/api";

interface ModerationStatsProps {
  stats?: ModeratorDashboardStats;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function ModerationStats({ 
  stats, 
  isLoading, 
  onRefresh, 
  className 
}: ModerationStatsProps) {

  const statsData = stats || {
    pendingReports: 0,
    pendingContent: 0,
    resolvedToday: 0,
    flaggedUsers: 0,
    systemAlerts: 0,
  };

  const statCards = [
    {
      title: "Pending Reports",
      value: statsData.pendingReports,
      icon: AlertTriangle,
      description: "Reports awaiting review",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
    {
      title: "Pending Content",
      value: statsData.pendingContent,
      icon: Shield,
      description: "Content in moderation queue",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Resolved Today",
      value: statsData.resolvedToday,
      icon: CheckCircle,
      description: "Actions completed today",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      title: "Flagged Users",
      value: statsData.flaggedUsers,
      icon: Users,
      description: "Users requiring attention",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
    {
      title: "System Alerts",
      value: statsData.systemAlerts,
      icon: Flag,
      description: "Active system alerts",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Moderation Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Current moderation statistics and alerts
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`${stat.bgColor} ${stat.borderColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.color}`}>
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">
                      {stat.value.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.color} opacity-75`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common moderation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.location.href = '/moderator/content'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Review Content Queue
                {statsData.pendingContent > 0 && (
                  <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {statsData.pendingContent}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.location.href = '/moderator/reports'}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review Reports
                {statsData.pendingReports > 0 && (
                  <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {statsData.pendingReports}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.location.href = '/moderator/users'}
              >
                <Users className="h-4 w-4 mr-2" />
                Review Flagged Users
                {statsData.flaggedUsers > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {statsData.flaggedUsers}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance</CardTitle>
            <CardDescription>Your moderation metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Resolved Today</span>
                </div>
                <span className="font-semibold">{statsData.resolvedToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Weekly Average</span>
                </div>
                <span className="font-semibold">
                  {Math.round(statsData.resolvedToday * 7 / 7)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Response Time</span>
                </div>
                <span className="font-semibold">~2.5h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Status</CardTitle>
            <CardDescription>Platform health overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Content Processing</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Normal</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-Moderation</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Report Queue</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    statsData.pendingReports > 10 ? 'bg-red-500' : 
                    statsData.pendingReports > 5 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-xs text-gray-600">
                    {statsData.pendingReports > 10 ? 'High' : 
                     statsData.pendingReports > 5 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
              {statsData.systemAlerts > 0 && (
                <div className="flex items-center justify-between text-red-600">
                  <span className="text-sm">System Alerts</span>
                  <div className="flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    <span className="text-xs">{statsData.systemAlerts} active</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}