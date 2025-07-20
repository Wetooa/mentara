"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Award,
  BookOpen,
  Camera,
  Save,
  Edit,
  Plus,
  X,
  CheckCircle,
  Star,
  Globe,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
} as const;

// Mock therapist profile data
const mockTherapistProfile = {
  id: "therapist_1",
  firstName: "Dr. Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@mentara.com",
  phone: "+1 (555) 123-4567",
  profilePhoto: "/avatars/sarah-therapist.jpg",
  bio: "Licensed clinical psychologist specializing in cognitive behavioral therapy, anxiety disorders, and trauma recovery. Over 8 years of experience helping clients achieve their mental health goals.",
  location: {
    address: "123 Wellness Center Dr",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "United States"
  },
  credentials: [
    { type: "License", number: "PSY12345", issuer: "California Board of Psychology", expiry: "2025-12-31" },
    { type: "Certification", number: "CBT-789", issuer: "Beck Institute", expiry: "2024-06-30" }
  ],
  specializations: ["Anxiety Disorders", "Depression", "Trauma & PTSD", "Cognitive Behavioral Therapy", "Mindfulness"],
  languages: ["English", "Spanish"],
  education: [
    { degree: "Ph.D. in Clinical Psychology", institution: "Stanford University", year: "2015" },
    { degree: "M.A. in Psychology", institution: "UC Berkeley", year: "2012" }
  ],
  availability: {
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "15:00" },
    saturday: { enabled: false, start: "", end: "" },
    sunday: { enabled: false, start: "", end: "" }
  },
  pricing: {
    sessionRate: 150,
    currency: "USD",
    sessionDuration: 50,
    acceptsInsurance: true,
    insuranceProviders: ["Blue Cross", "Aetna", "Kaiser Permanente"],
    paymentMethods: ["Credit Card", "PayPal", "Insurance"]
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    automaticBooking: true,
    bufferTime: 15,
    maxDailyClients: 8
  },
  stats: {
    totalClients: 124,
    activeClients: 28,
    completedSessions: 892,
    averageRating: 4.8,
    yearsExperience: 8
  }
};

export default function TherapistProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showCredentialDialog, setShowCredentialDialog] = useState(false);
  const [profile, setProfile] = useState(mockTherapistProfile);
  const [editData, setEditData] = useState(mockTherapistProfile);

  const handleSave = () => {
    setProfile(editData);
    setIsEditing(false);
    // TODO: Implement API call to save profile
    console.log("Saving profile:", editData);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const addSpecialization = (specialization: string) => {
    if (specialization && !editData.specializations.includes(specialization)) {
      setEditData(prev => ({
        ...prev,
        specializations: [...prev.specializations, specialization]
      }));
    }
  };

  const removeSpecialization = (index: number) => {
    setEditData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your professional profile and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {/* Profile Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.profilePhoto} alt={`${profile.firstName} ${profile.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-2">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.firstName}
                        onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{profile.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={editData.lastName}
                        onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 font-medium">{profile.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Professional Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1 min-h-[100px]"
                      placeholder="Tell potential clients about your background, experience, and approach..."
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{profile.bio}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {profile.stats.averageRating} rating ({profile.stats.completedSessions} sessions)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    {profile.stats.yearsExperience} years experience
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {profile.stats.activeClients} active clients
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Contact</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="specializations">Specializations</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Contact Information Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Practice Address</Label>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <Input
                        placeholder="Street Address"
                        value={editData.location.address}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          location: { ...prev.location, address: e.target.value }
                        }))}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="City"
                          value={editData.location.city}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            location: { ...prev.location, city: e.target.value }
                          }))}
                        />
                        <Input
                          placeholder="State"
                          value={editData.location.state}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            location: { ...prev.location, state: e.target.value }
                          }))}
                        />
                        <Input
                          placeholder="ZIP Code"
                          value={editData.location.zipCode}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            location: { ...prev.location, zipCode: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p>{profile.location.address}</p>
                        <p>{profile.location.city}, {profile.location.state} {profile.location.zipCode}</p>
                        <p>{profile.location.country}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.languages.map((language, index) => (
                      <Badge key={index} variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Professional Credentials</CardTitle>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCredentialDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Credential
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.credentials.map((credential, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{credential.type}: {credential.number}</p>
                          <p className="text-sm text-gray-600">{credential.issuer}</p>
                          <p className="text-xs text-gray-500">Expires: {credential.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {isEditing && (
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Education</h4>
                    <div className="space-y-2">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{edu.degree}</span>
                          <span className="text-gray-600">from {edu.institution} ({edu.year})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specializations Tab */}
          <TabsContent value="specializations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Areas of Specialization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {editData.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {spec}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSpecialization(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new specialization..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSpecialization(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addSpecialization(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(editData.availability).map(([day, schedule]) => (
                      <div key={day} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={(checked) =>
                              setEditData(prev => ({
                                ...prev,
                                availability: {
                                  ...prev.availability,
                                  [day]: { ...schedule, enabled: checked }
                                }
                              }))
                            }
                            disabled={!isEditing}
                          />
                          <Label className="capitalize font-medium">{day}</Label>
                        </div>
                        {schedule.enabled && (
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Input
                                  type="time"
                                  value={schedule.start}
                                  onChange={(e) =>
                                    setEditData(prev => ({
                                      ...prev,
                                      availability: {
                                        ...prev.availability,
                                        [day]: { ...schedule, start: e.target.value }
                                      }
                                    }))
                                  }
                                  className="w-24"
                                />
                                <span>to</span>
                                <Input
                                  type="time"
                                  value={schedule.end}
                                  onChange={(e) =>
                                    setEditData(prev => ({
                                      ...prev,
                                      availability: {
                                        ...prev.availability,
                                        [day]: { ...schedule, end: e.target.value }
                                      }
                                    }))
                                  }
                                  className="w-24"
                                />
                              </>
                            ) : (
                              <span className="text-sm text-gray-600">
                                {schedule.start} - {schedule.end}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Session Rate</Label>
                    {isEditing ? (
                      <div className="mt-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          value={editData.pricing.sessionRate}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            pricing: { ...prev.pricing, sessionRate: Number(e.target.value) }
                          }))}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">per session</span>
                      </div>
                    ) : (
                      <p className="mt-1 font-medium">${profile.pricing.sessionRate} / {profile.pricing.sessionDuration} minutes</p>
                    )}
                  </div>

                  <div>
                    <Label>Session Duration</Label>
                    {isEditing ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <Select
                          value={editData.pricing.sessionDuration.toString()}
                          onValueChange={(value) => setEditData(prev => ({
                            ...prev,
                            pricing: { ...prev.pricing, sessionDuration: Number(value) }
                          }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="50">50 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <p className="mt-1">{profile.pricing.sessionDuration} minutes</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Accepts Insurance</Label>
                    <Switch
                      checked={editData.pricing.acceptsInsurance}
                      onCheckedChange={(checked) =>
                        setEditData(prev => ({
                          ...prev,
                          pricing: { ...prev.pricing, acceptsInsurance: checked }
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  {editData.pricing.acceptsInsurance && (
                    <div>
                      <Label>Insurance Providers</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {profile.pricing.insuranceProviders.map((provider, index) => (
                          <Badge key={index} variant="outline">{provider}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Email Notifications</Label>
                      <Switch
                        checked={editData.preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setEditData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailNotifications: checked }
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>SMS Notifications</Label>
                      <Switch
                        checked={editData.preferences.smsNotifications}
                        onCheckedChange={(checked) =>
                          setEditData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, smsNotifications: checked }
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Booking Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Automatic Booking Approval</Label>
                      <Switch
                        checked={editData.preferences.automaticBooking}
                        onCheckedChange={(checked) =>
                          setEditData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, automaticBooking: checked }
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label>Buffer Time Between Sessions</Label>
                      {isEditing ? (
                        <Select
                          value={editData.preferences.bufferTime.toString()}
                          onValueChange={(value) => setEditData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, bufferTime: Number(value) }
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No buffer</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1">{profile.preferences.bufferTime} minutes</p>
                      )}
                    </div>

                    <div>
                      <Label>Maximum Clients Per Day</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={editData.preferences.maxDailyClients}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, maxDailyClients: Number(e.target.value) }
                          }))}
                          className="mt-1 w-24"
                        />
                      ) : (
                        <p className="mt-1">{profile.preferences.maxDailyClients} clients</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add Credential Dialog */}
      <Dialog open={showCredentialDialog} onOpenChange={setShowCredentialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Professional Credential</DialogTitle>
            <DialogDescription>
              Add a new license, certification, or professional credential.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Credential Type</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="license">Professional License</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="degree">Academic Degree</SelectItem>
                  <SelectItem value="membership">Professional Membership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Credential Number</Label>
              <Input className="mt-1" placeholder="Enter credential number" />
            </div>
            <div>
              <Label>Issuing Organization</Label>
              <Input className="mt-1" placeholder="e.g., State Board of Psychology" />
            </div>
            <div>
              <Label>Expiration Date</Label>
              <Input type="date" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCredentialDialog(false)}>
              Add Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}