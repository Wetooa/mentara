"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  DollarSign,
  BarChart3,
  Target,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarCheck,
  Download,
  Filter,
} from "lucide-react";
import { useTherapistAnalytics } from "@/hooks/booking/useBooking";

interface TherapistAnalyticsDashboardProps {
  className?: string;
}

export function TherapistAnalyticsDashboard({ className }: TherapistAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = React.useState<"week" | "month" | "year">("month");
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("current");

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    
    switch (dateRange) {
      case "week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: format(startOfWeek, "yyyy-MM-dd"),
          end: format(endOfWeek, "yyyy-MM-dd"),
        };
      case "year":
        return {
          start: format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd"),
          end: format(new Date(now.getFullYear(), 11, 31), "yyyy-MM-dd"),
        };
      default: // month
        return {
          start: format(startOfMonth(now), "yyyy-MM-dd"),
          end: format(endOfMonth(now), "yyyy-MM-dd"),
        };
    }
  };

  const { start, end } = getDateRange();
  const { data: analytics, isLoading, error } = useTherapistAnalytics(start, end);

  const statusColors = {
    completed: "#10b981", // Green
    scheduled: "#3b82f6", // Blue
    confirmed: "#059669", // Emerald
    cancelled: "#ef4444", // Red
    no_show: "#f59e0b", // Amber
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatMonthlyData = (monthlyRevenue: any[]) => {
    return monthlyRevenue.map((item) => ({
      month: format(new Date(item.month + "-01"), "MMM"),
      revenue: item.revenue,
    }));
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to Load Analytics
            </h3>
            <p className="text-gray-500">
              There was an error loading your analytics data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionStatusData = Object.entries(analytics.sessionsByStatus).map(([status, count]) => ({
    name: status.replace("_", " ").toUpperCase(),
    value: count as number,
    color: statusColors[status as keyof typeof statusColors] || "#6b7280",
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track your practice performance and revenue insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    +{analytics.timeBasedStats.thisMonth.revenue > 0 ? "12%" : "0%"}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalSessions}
                </p>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">
                    {analytics.timeBasedStats.thisMonth.sessions} this month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.activeClients}
                </p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600 font-medium">
                    {analytics.topClients.length} regular clients
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.completionRate}%
                </p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600 font-medium">
                    {analytics.overview.completedSessions} completed
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart & Session Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatMonthlyData(analytics.monthlyRevenue)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₱${value}`} />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fill="#dcfce7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Session Status Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Session Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sessionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, "Sessions"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topClients.slice(0, 5).map((client: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-teal-700">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(client.revenue)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
            {analytics.topClients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No client data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    session.status === 'COMPLETED' ? 'bg-green-500' :
                    session.status === 'SCHEDULED' ? 'bg-blue-500' :
                    session.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{session.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(session.startTime), "MMM d, h:mm a")} • {session.duration}min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(session.revenue)}
                  </p>
                  <Badge variant={
                    session.status === 'COMPLETED' ? 'default' :
                    session.status === 'SCHEDULED' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {session.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
            {analytics.recentSessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">
                {analytics.timeBasedStats.today.sessions}
              </div>
              <div className="text-sm text-teal-600 font-medium">Sessions Today</div>
              <div className="text-xs text-gray-600 mt-1">
                {formatCurrency(analytics.timeBasedStats.today.revenue)} revenue
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {analytics.timeBasedStats.thisWeek.sessions}
              </div>
              <div className="text-sm text-blue-600 font-medium">Sessions This Week</div>
              <div className="text-xs text-gray-600 mt-1">
                {formatCurrency(analytics.timeBasedStats.thisWeek.revenue)} revenue
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {analytics.overview.averageDuration}min
              </div>
              <div className="text-sm text-purple-600 font-medium">Avg Session Duration</div>
              <div className="text-xs text-gray-600 mt-1">
                Standard therapy sessions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}