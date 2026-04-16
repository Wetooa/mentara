"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Activity,
  BookOpen,
  MessageSquare,
  Award,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Patient } from "@/types/patient";

interface PatientProgressDashboardProps {
  patient: Patient;
}

interface ProgressMetric {
  label: string;
  value: number;
  total: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  category: "therapy" | "behavioral" | "medication" | "lifestyle";
}

// Mock progress data - in real implementation, this would come from API
const generateProgressMetrics = (patient: Patient): ProgressMetric[] => [
  {
    label: "Overall Progress",
    value: patient.progress,
    total: 100,
    percentage: patient.progress,
    trend: "up",
    trendValue: 12,
  },
  {
    label: "Session Attendance",
    value: patient.currentSession,
    total: patient.totalSessions,
    percentage: (patient.currentSession / patient.totalSessions) * 100,
    trend: "up",
    trendValue: 8,
  },
  {
    label: "Worksheet Completion",
    value:
      patient.worksheets?.filter(
        (w) => w.status === "completed" || w.status === "reviewed"
      ).length || 0,
    total: patient.worksheets?.length || 0,
    percentage: patient.worksheets?.length
      ? (patient.worksheets.filter(
          (w) => w.status === "completed" || w.status === "reviewed"
        ).length /
          patient.worksheets.length) *
        100
      : 0,
    trend: "stable",
    trendValue: 0,
  },
  {
    label: "Treatment Goals",
    value: 7,
    total: 10,
    percentage: 70,
    trend: "up",
    trendValue: 15,
  },
];

const generateMilestones = (): Milestone[] => [
  {
    id: "1",
    title: "Establish Therapeutic Rapport",
    description: "Build trust and establish open communication with therapist",
    targetDate: "2024-02-15",
    completed: true,
    completedDate: "2024-02-10",
    category: "therapy",
  },
  {
    id: "2",
    title: "Identify Triggers",
    description: "Recognize and document anxiety triggers in daily life",
    targetDate: "2024-03-01",
    completed: true,
    completedDate: "2024-02-28",
    category: "behavioral",
  },
  {
    id: "3",
    title: "Practice Breathing Techniques",
    description: "Master deep breathing exercises for anxiety management",
    targetDate: "2024-03-15",
    completed: false,
    category: "behavioral",
  },
  {
    id: "4",
    title: "Medication Adherence",
    description: "Maintain consistent medication schedule for 30 days",
    targetDate: "2024-04-01",
    completed: false,
    category: "medication",
  },
  {
    id: "5",
    title: "Social Reintegration",
    description: "Attend 2 social events per week",
    targetDate: "2024-04-15",
    completed: false,
    category: "lifestyle",
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "therapy":
      return MessageSquare;
    case "behavioral":
      return Activity;
    case "medication":
      return Target;
    case "lifestyle":
      return Calendar;
    default:
      return CheckCircle;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "therapy":
      return "bg-blue-100 text-blue-800";
    case "behavioral":
      return "bg-green-100 text-green-800";
    case "medication":
      return "bg-purple-100 text-purple-800";
    case "lifestyle":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function PatientProgressDashboard({
  patient,
}: PatientProgressDashboardProps) {
  const progressMetrics = generateProgressMetrics(patient);
  const milestones = generateMilestones();
  const completedMilestones = milestones.filter((m) => m.completed);
  const upcomingMilestones = milestones.filter((m) => !m.completed);

  return (
    <div className="space-y-6">
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {progressMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                  )}
                  <span
                    className={`text-xs ${
                      metric.trend === "up"
                        ? "text-green-500"
                        : metric.trend === "down"
                          ? "text-red-500"
                          : "text-gray-500"
                    }`}
                  >
                    {metric.trendValue > 0
                      ? `+${metric.trendValue}%`
                      : metric.trendValue < 0
                        ? `${metric.trendValue}%`
                        : "--"}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {metric.value}
                  {metric.total > 0 && `/${metric.total}`}
                </div>
                <Progress value={metric.percentage} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {metric.percentage.toFixed(1)}% complete
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Timeline */}
              <div className="space-y-3">
                {[
                  { week: "Week 1", progress: 25, sessions: 2 },
                  { week: "Week 2", progress: 35, sessions: 2 },
                  { week: "Week 3", progress: 50, sessions: 3 },
                  { week: "Week 4", progress: 65, sessions: 2 },
                  {
                    week: "Week 5",
                    progress: patient.progress,
                    sessions: patient.currentSession - 9,
                  },
                ].map((week, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{week.week}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={week.progress} className="w-24" />
                      <span className="text-xs text-muted-foreground">
                        {week.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  type: "session",
                  title: "Therapy Session Completed",
                  description: "Cognitive Behavioral Therapy - Session 12",
                  date: "2 days ago",
                  icon: MessageSquare,
                  color: "text-blue-600",
                },
                {
                  type: "worksheet",
                  title: "Worksheet Submitted",
                  description: "Anxiety Tracking Journal - Week 3",
                  date: "4 days ago",
                  icon: BookOpen,
                  color: "text-green-600",
                },
                {
                  type: "milestone",
                  title: "Milestone Achieved",
                  description: "Identified personal anxiety triggers",
                  date: "1 week ago",
                  icon: Award,
                  color: "text-purple-600",
                },
                {
                  type: "session",
                  title: "Session Scheduled",
                  description: "Next appointment: Tomorrow at 2:00 PM",
                  date: "3 days ago",
                  icon: Calendar,
                  color: "text-orange-600",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-full bg-gray-100 ${activity.color}`}
                  >
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Treatment Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completed Milestones */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Completed ({completedMilestones.length})
              </h4>
              <div className="space-y-3">
                {completedMilestones.map((milestone) => {
                  const IconComponent = getCategoryIcon(milestone.category);
                  return (
                    <div
                      key={milestone.id}
                      className="border rounded-lg p-3 bg-green-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-1 rounded bg-green-100">
                            <IconComponent className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium">
                              {milestone.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className={getCategoryColor(milestone.category)}
                              >
                                {milestone.category}
                              </Badge>
                              <span className="text-xs text-green-600">
                                Completed {milestone.completedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Upcoming ({upcomingMilestones.length})
              </h4>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone) => {
                  const IconComponent = getCategoryIcon(milestone.category);
                  const isOverdue = new Date(milestone.targetDate) < new Date();
                  return (
                    <div
                      key={milestone.id}
                      className={`border rounded-lg p-3 ${
                        isOverdue ? "bg-red-50 border-red-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-1 rounded ${
                              isOverdue ? "bg-red-100" : "bg-gray-100"
                            }`}
                          >
                            <IconComponent
                              className={`h-3 w-3 ${
                                isOverdue ? "text-red-600" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium">
                              {milestone.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className={getCategoryColor(milestone.category)}
                              >
                                {milestone.category}
                              </Badge>
                              <span
                                className={`text-xs ${
                                  isOverdue
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Target: {milestone.targetDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isOverdue && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: "Practice mindfulness daily",
                  progress: 80,
                  description: "Daily 10-minute meditation sessions",
                },
                {
                  title: "Reduce anxiety episodes",
                  progress: 65,
                  description: "From 5 to 2 episodes per week",
                },
                {
                  title: "Improve sleep quality",
                  progress: 45,
                  description: "Achieve 7-8 hours of restful sleep",
                },
              ].map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress value={goal.progress} />
                  <p className="text-xs text-muted-foreground">
                    {goal.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  type: "focus",
                  title: "Increase session frequency",
                  description: "Consider weekly sessions for better progress",
                  priority: "high",
                },
                {
                  type: "worksheet",
                  title: "Add journaling exercises",
                  description:
                    "Daily mood tracking might help identify patterns",
                  priority: "medium",
                },
                {
                  type: "lifestyle",
                  title: "Incorporate physical activity",
                  description: "Light exercise can support anxiety management",
                  priority: "medium",
                },
              ].map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <div
                    className={`p-1 rounded ${
                      rec.priority === "high" ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    <TrendingUp
                      className={`h-3 w-3 ${
                        rec.priority === "high"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium">{rec.title}</h5>
                      <Badge
                        variant={
                          rec.priority === "high" ? "destructive" : "secondary"
                        }
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.description}
                    </p>
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
