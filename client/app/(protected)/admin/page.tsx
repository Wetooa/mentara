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
import { Activity, AlertTriangle, FileText, Users } from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data for the dashboard
  const stats = [
    { 
      title: "Total Users", 
      value: "5,231", 
      change: "+12%", 
      trend: "up", 
      description: "Compared to last month",
      icon: <Users className="h-5 w-5 text-blue-500" />
    },
    { 
      title: "Active Reports", 
      value: "27", 
      change: "+5", 
      trend: "up", 
      description: "Unresolved reports",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
    },
    { 
      title: "Content Published", 
      value: "423", 
      change: "+42", 
      trend: "up", 
      description: "Last 30 days",
      icon: <FileText className="h-5 w-5 text-green-500" />
    },
    { 
      title: "Active Sessions", 
      value: "189", 
      change: "+18%", 
      trend: "up", 
      description: "Current week",
      icon: <Activity className="h-5 w-5 text-purple-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to the Mentara admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <span className={`ml-2 text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-md">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start" asChild>
            <a href="/admin/reports">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
              View Reports
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href="/admin/users">
              <Users className="mr-2 h-4 w-4 text-blue-600" />
              Manage Users
            </a>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <a href="/admin/content/search">
              <FileText className="mr-2 h-4 w-4 text-green-600" />
              Content Search
            </a>
          </Button>
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
    </div>
  );
}
