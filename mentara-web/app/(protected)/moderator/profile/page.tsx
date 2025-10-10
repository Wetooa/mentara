"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Clock,
  Activity,
  Download,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Mock moderator profile data
const mockModeratorProfile = {
  id: "mod_1",
  firstName: "Jane",
  lastName: "Moderator",
  email: "jane.moderator@mentara.com",
  avatarUrl: "/avatars/jane.jpg",
  role: "moderator",
  status: "active",
  joinedAt: "2023-06-15T10:00:00Z",
  lastActive: "2025-01-17T12:30:00Z",
  permissions: [
    "content_moderation",
    "user_management", 
    "report_review",
    "audit_log_access"
  ],
  stats: {
    totalActions: 1247,
    reportsReviewed: 156,
    usersModerated: 23,
    contentModerated: 89
  },
  preferences: {
    emailNotifications: true,
    browserNotifications: false,
    weeklyDigest: true,
    realTimeAlerts: true,
    autoAssignReports: false,
    language: "en",
    timezone: "UTC-8"
  },
  security: {
    lastPasswordChange: "2024-12-01T10:00:00Z",
    twoFactorEnabled: true,
    lastLogin: "2025-01-17T08:00:00Z",
    loginAttempts: 0
  }
};

const mockRecentActivity = [
  {
    id: "1",
    action: "Content Moderated",
    target: "Post by Dr. Smith",
    timestamp: "2025-01-17T11:30:00Z",
    status: "approved"
  },
  {
    id: "2", 
    action: "User Suspended",
    target: "Alex Wilson",
    timestamp: "2025-01-17T10:15:00Z",
    status: "completed"
  },
  {
    id: "3",
    action: "Report Reviewed",
    target: "Harassment Report #156",
    timestamp: "2025-01-17T09:45:00Z",
    status: "resolved"
  }
];

export default function ModeratorProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(mockModeratorProfile);
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSaveProfile = () => {
    console.log("Saving profile changes:", formData);
    setProfile(prev => ({
      ...prev,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email
    }));
    setIsEditing(false);
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Moderator Profile</h1>
          <p className="text-gray-600">Manage your profile settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Activity
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </motion.div>

      {/* Profile Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold">{profile.stats.totalActions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reports Reviewed</p>
                <p className="text-2xl font-bold text-green-600">{profile.stats.reportsReviewed}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Users Moderated</p>
                <p className="text-2xl font-bold text-orange-600">{profile.stats.usersModerated}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Content Moderated</p>
                <p className="text-2xl font-bold text-purple-600">{profile.stats.contentModerated}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Profile Info Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <div className="mt-1">
                      <Badge className="bg-purple-100 text-purple-800 capitalize">
                        {profile.role}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Permissions</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="capitalize">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                      <AvatarFallback className="text-xl">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Photo
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">{formatDate(profile.joinedAt)?.split(',')[0] || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-medium">{formatDate(profile.lastActive)?.split(',')[1]?.trim() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800 capitalize">
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password & Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="mt-1"
                    />
                  </div>

                  <Button className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Two-Factor Authentication</span>
                      <div className="flex items-center gap-2">
                        <Badge className={profile.security.twoFactorEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {profile.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={profile.security.twoFactorEnabled}
                          onCheckedChange={(checked) => 
                            setProfile(prev => ({
                              ...prev,
                              security: { ...prev.security, twoFactorEnabled: checked }
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Password Change</span>
                        <span className="font-medium">{formatDate(profile.security.lastPasswordChange)?.split(',')[0] || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Login</span>
                        <span className="font-medium">{formatDate(profile.security.lastLogin)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Failed Login Attempts</span>
                        <span className="font-medium">{profile.security.loginAttempts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Security Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={profile.preferences.emailNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Browser Notifications</Label>
                        <p className="text-sm text-gray-500">Show desktop notifications</p>
                      </div>
                      <Switch
                        checked={profile.preferences.browserNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('browserNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Digest</Label>
                        <p className="text-sm text-gray-500">Weekly summary of activities</p>
                      </div>
                      <Switch
                        checked={profile.preferences.weeklyDigest}
                        onCheckedChange={(checked) => handlePreferenceChange('weeklyDigest', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Real-time Alerts</Label>
                        <p className="text-sm text-gray-500">Immediate alerts for urgent reports</p>
                      </div>
                      <Switch
                        checked={profile.preferences.realTimeAlerts}
                        onCheckedChange={(checked) => handlePreferenceChange('realTimeAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-assign Reports</Label>
                        <p className="text-sm text-gray-500">Automatically assign new reports to you</p>
                      </div>
                      <Switch
                        checked={profile.preferences.autoAssignReports}
                        onCheckedChange={(checked) => handlePreferenceChange('autoAssignReports', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Language</Label>
                    <Select
                      value={profile.preferences.language}
                      onValueChange={(value) => handlePreferenceChange('language', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Timezone</Label>
                    <Select
                      value={profile.preferences.timezone}
                      onValueChange={(value) => handlePreferenceChange('timezone', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="UTC+0">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4">
                    <Button className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Moderation Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Activity className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.target}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {mockRecentActivity.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-2 text-gray-600">
                      Your moderation activities will appear here.
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