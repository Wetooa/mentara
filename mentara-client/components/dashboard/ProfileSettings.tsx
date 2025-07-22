"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Settings,
  Camera,
  Calendar,
  Save,
  X,
} from "lucide-react";
import type { UserDashboardData } from "@/types/api/dashboard";

interface ProfileSettingsProps {
  user: UserDashboardData["user"];
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettings({
  user,
  isOpen,
  onClose,
}: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: "+1 (555) 123-4567",
    bio: "Focused on improving my mental health and building better coping strategies.",
    dateOfBirth: "1990-05-15",
    emergencyContact: "Jane Smith - (555) 987-6543",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    sessionReminders: true,
    worksheetDeadlines: true,
    therapistMessages: true,
    communityUpdates: false,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "therapists", // "public", "therapists", "private"
    shareProgress: true,
    allowMessaging: true,
    showOnlineStatus: true,
  });

  const handleSave = () => {
    // TODO: Save profile settings to API
    // API integration to be implemented
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (setting: string) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  const handlePrivacyToggle = (setting: string) => {
    setPrivacy(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your profile information, notifications, and privacy settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details and personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500">
                      JPG, GIF or PNG. Max size of 5MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Name - Phone Number"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={() => handleNotificationToggle("pushNotifications")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Reminders</Label>
                      <p className="text-sm text-gray-500">
                        Get reminders about upcoming therapy sessions
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sessionReminders}
                      onCheckedChange={() => handleNotificationToggle("sessionReminders")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Worksheet Deadlines</Label>
                      <p className="text-sm text-gray-500">
                        Notifications about upcoming worksheet due dates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.worksheetDeadlines}
                      onCheckedChange={() => handleNotificationToggle("worksheetDeadlines")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Therapist Messages</Label>
                      <p className="text-sm text-gray-500">
                        Notifications when therapists send you messages
                      </p>
                    </div>
                    <Switch
                      checked={notifications.therapistMessages}
                      onCheckedChange={() => handleNotificationToggle("therapistMessages")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Community Updates</Label>
                      <p className="text-sm text-gray-500">
                        Updates from community groups and forums
                      </p>
                    </div>
                    <Switch
                      checked={notifications.communityUpdates}
                      onCheckedChange={() => handleNotificationToggle("communityUpdates")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-500">
                        Promotional emails and feature updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationToggle("marketingEmails")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your information and interact with you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-gray-500">
                      Who can view your profile information
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="public"
                          name="profileVisibility"
                          checked={privacy.profileVisibility === "public"}
                          onChange={() => setPrivacy(prev => ({ ...prev, profileVisibility: "public" }))}
                        />
                        <Label htmlFor="public">Public - Anyone can view</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="therapists"
                          name="profileVisibility"
                          checked={privacy.profileVisibility === "therapists"}
                          onChange={() => setPrivacy(prev => ({ ...prev, profileVisibility: "therapists" }))}
                        />
                        <Label htmlFor="therapists">Therapists Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="private"
                          name="profileVisibility"
                          checked={privacy.profileVisibility === "private"}
                          onChange={() => setPrivacy(prev => ({ ...prev, profileVisibility: "private" }))}
                        />
                        <Label htmlFor="private">Private - Only you</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Progress</Label>
                      <p className="text-sm text-gray-500">
                        Allow therapists to see your progress data
                      </p>
                    </div>
                    <Switch
                      checked={privacy.shareProgress}
                      onCheckedChange={() => handlePrivacyToggle("shareProgress")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Messaging</Label>
                      <p className="text-sm text-gray-500">
                        Allow others to send you messages
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowMessaging}
                      onCheckedChange={() => handlePrivacyToggle("allowMessaging")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Online Status</Label>
                      <p className="text-sm text-gray-500">
                        Let others see when you&apos;re online
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showOnlineStatus}
                      onCheckedChange={() => handlePrivacyToggle("showOnlineStatus")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View your account details and membership information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Badge variant="default" className="w-fit">
                      Active Member
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <Badge variant="secondary" className="w-fit">
                      Premium Plan
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Sessions Remaining</Label>
                    <span className="font-semibold">12 sessions</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Account Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      Deactivate Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}