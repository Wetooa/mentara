'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Target,
  MessageSquare,
  Timer
} from 'lucide-react';

interface RequestStatisticsData {
  overview: {
    totalRequests: number;
    pendingRequests: number;
    acceptedToday: number;
    declinedToday: number;
    averageResponseTime: number; // in hours
    responseRate: number; // percentage
  };
  trends: {
    weeklyRequests: number;
    weeklyAccepted: number;
    weeklyDeclined: number;
    weeklyChange: number; // percentage change
  };
  performance: {
    averageMatchScore: number;
    clientSatisfaction: number;
    conversionRate: number; // accepted/total
    averageSessionsPerClient: number;
  };
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

interface RequestStatisticsProps {
  statistics: RequestStatisticsData;
}

export function RequestStatistics({ statistics }: RequestStatisticsProps) {
  const { overview, trends, performance, timeDistribution } = statistics;
  
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />; // neutral
  };
  
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getResponseTimeColor = (hours: number) => {
    if (hours <= 2) return 'text-green-600';
    if (hours <= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {overview.pendingRequests} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.acceptedToday}</div>
            <p className="text-xs text-muted-foreground">
              {overview.responseRate.toFixed(1)}% response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResponseTimeColor(overview.averageResponseTime)}`}>
              {overview.averageResponseTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performance.conversionRate)}`}>
              {performance.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted vs total requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Requests</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{trends.weeklyRequests}</span>
                  {getChangeIcon(trends.weeklyChange)}
                  <span className={`text-sm ${getChangeColor(trends.weeklyChange)}`}>
                    {Math.abs(trends.weeklyChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accepted</span>
                <span className="text-lg font-bold text-green-600">{trends.weeklyAccepted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Declined</span>
                <span className="text-lg font-bold text-red-600">{trends.weeklyDeclined}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Acceptance Rate</span>
                  <span>{((trends.weeklyAccepted / (trends.weeklyAccepted + trends.weeklyDeclined)) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(trends.weeklyAccepted / (trends.weeklyAccepted + trends.weeklyDeclined)) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Match Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{performance.averageMatchScore.toFixed(1)}%</span>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Satisfaction</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">{performance.clientSatisfaction.toFixed(1)}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Sessions/Client</span>
                <span className="text-lg font-bold text-blue-600">{performance.averageSessionsPerClient.toFixed(1)}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Performance</span>
                  <span>{performance.conversionRate.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={performance.conversionRate}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution and Response Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Morning (6-12)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{timeDistribution.morning}%</span>
                  <div className="w-16">
                    <Progress 
                      value={timeDistribution.morning}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Afternoon (12-18)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{timeDistribution.afternoon}%</span>
                  <div className="w-16">
                    <Progress 
                      value={timeDistribution.afternoon}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Evening (18-24)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{timeDistribution.evening}%</span>
                  <div className="w-16">
                    <Progress 
                      value={timeDistribution.evening}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Response Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{overview.responseRate.toFixed(1)}%</span>
                  <div className="w-16">
                    <Progress 
                      value={overview.responseRate}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Timely Responses</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {overview.averageResponseTime <= 24 ? '95%' : '78%'}
                  </span>
                  <div className="w-16">
                    <Progress 
                      value={overview.averageResponseTime <= 24 ? 95 : 78}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Detailed Responses</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">87%</span>
                  <div className="w-16">
                    <Progress 
                      value={87}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Urgent Requests</span>
                </div>
                <Badge variant="outline" className="text-orange-600">
                  {overview.pendingRequests > 5 ? 'High' : 'Normal'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Avg Message Length</span>
                </div>
                <span className="text-sm font-medium">156 words</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Match Quality</span>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {performance.averageMatchScore >= 80 ? 'Excellent' : 'Good'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}