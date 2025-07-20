'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  // AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  // Shield,
  Star
} from 'lucide-react';

interface StatisticsData {
  overview: {
    totalApplications: number;
    pendingReview: number;
    approvedToday: number;
    rejectedToday: number;
    averageProcessingTime: number; // in hours
    approvalRate: number; // percentage
  };
  trends: {
    weeklyApplications: number;
    weeklyApprovals: number;
    weeklyRejections: number;
    weeklyChange: number; // percentage change
  };
  demographics: {
    provinces: Array<{ name: string; count: number }>;
    providerTypes: Array<{ name: string; count: number }>;
    experienceLevels: Array<{ range: string; count: number }>;
  };
  performance: {
    averageRating: number;
    ratedTherapists: number;
    totalTherapists: number;
    activeTherapists: number;
  };
}

interface TherapistStatisticsProps {
  statistics: StatisticsData;
}

export function TherapistStatistics({ statistics }: TherapistStatisticsProps) {
  const { overview, trends, demographics, performance } = statistics;
  
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

  return (
    <div className="grid gap-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {overview.pendingReview} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.approvedToday}</div>
            <p className="text-xs text-muted-foreground">
              {overview.approvalRate.toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.rejectedToday}</div>
            <p className="text-xs text-muted-foreground">
              Quality assurance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.averageProcessingTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Time to review
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
                <span className="text-sm font-medium">New Applications</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{trends.weeklyApplications}</span>
                  {getChangeIcon(trends.weeklyChange)}
                  <span className={`text-sm ${getChangeColor(trends.weeklyChange)}`}>
                    {Math.abs(trends.weeklyChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approvals</span>
                <span className="text-lg font-bold text-green-600">{trends.weeklyApprovals}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rejections</span>
                <span className="text-lg font-bold text-red-600">{trends.weeklyRejections}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Approval Rate</span>
                  <span>{((trends.weeklyApprovals / (trends.weeklyApprovals + trends.weeklyRejections)) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(trends.weeklyApprovals / (trends.weeklyApprovals + trends.weeklyRejections)) * 100}
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
              Therapist Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Rating</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{performance.averageRating.toFixed(1)}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Therapists</span>
                <span className="text-lg font-bold">{performance.totalTherapists}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Therapists</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">{performance.activeTherapists}</span>
                  <Badge variant="secondary" className="text-xs">
                    {((performance.activeTherapists / performance.totalTherapists) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Therapists with Reviews</span>
                  <span>{performance.ratedTherapists}/{performance.totalTherapists}</span>
                </div>
                <Progress 
                  value={(performance.ratedTherapists / performance.totalTherapists) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provinces */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Provinces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demographics.provinces.slice(0, 5).map((province, index) => (
                <div key={province.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{province.name}</span>
                  </div>
                  <span className="text-sm font-medium">{province.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Provider Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provider Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demographics.providerTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between">
                  <span className="text-sm">{type.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{type.count}</span>
                    <div className="w-16">
                      <Progress 
                        value={(type.count / overview.totalApplications) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demographics.experienceLevels.map((level) => (
                <div key={level.range} className="flex items-center justify-between">
                  <span className="text-sm">{level.range}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{level.count}</span>
                    <div className="w-16">
                      <Progress 
                        value={(level.count / overview.totalApplications) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}