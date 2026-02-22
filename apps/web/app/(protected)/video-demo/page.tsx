"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MeetingAccess } from '@/components/meeting/MeetingAccess';
import { 
  Video, 
  Calendar, 
  Users, 
  Clock,
  Play,
  Settings,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format, addHours, addDays } from 'date-fns';

// Mock meeting data for demonstration
const mockMeetings = [
  {
    id: 'demo-meeting-1',
    title: 'Weekly Therapy Session',
    startTime: new Date().toISOString(), // Now
    endTime: addHours(new Date(), 1).toISOString(),
    status: 'IN_PROGRESS' as const,
    therapist: {
      firstName: 'Sarah',
      lastName: 'Johnson',
    },
    client: {
      firstName: 'John',
      lastName: 'Doe',
    },
  },
  {
    id: 'demo-meeting-2',
    title: 'CBT Session',
    startTime: addDays(new Date(), 1).toISOString(), // Tomorrow
    endTime: addDays(addHours(new Date(), 1), 1).toISOString(),
    status: 'SCHEDULED' as const,
    therapist: {
      firstName: 'Michael',
      lastName: 'Brown',
    },
    client: {
      firstName: 'Jane',
      lastName: 'Smith',
    },
  },
  {
    id: 'demo-meeting-3',
    title: 'Initial Consultation',
    startTime: addDays(new Date(), -2).toISOString(), // 2 days ago
    endTime: addDays(addHours(new Date(), 1), -2).toISOString(),
    status: 'COMPLETED' as const,
    therapist: {
      firstName: 'Emily',
      lastName: 'Davis',
    },
    client: {
      firstName: 'Bob',
      lastName: 'Wilson',
    },
  },
];

export default function VideoDemoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [customMeetingId, setCustomMeetingId] = useState('');
  const [userRole, setUserRole] = useState<'client' | 'therapist'>('client');

  const handleJoinCustomMeeting = () => {
    if (customMeetingId.trim()) {
      router.push(`/${userRole}/meeting/${customMeetingId}`);
    }
  };

  const handleCreateTestMeeting = () => {
    // Navigate to the demo meeting
    router.push(`/${userRole}/meeting/demo-meeting-1`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Video Meeting Demo</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience Mentara's comprehensive video meeting platform with WebRTC integration, 
            real-time controls, and professional therapy session features.
          </p>
        </div>

        {/* User Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demo Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">View as:</label>
              <div className="flex gap-2">
                <Button
                  variant={userRole === 'client' ? 'default' : 'outline'}
                  onClick={() => setUserRole('client')}
                  size="sm"
                >
                  Client
                </Button>
                <Button
                  variant={userRole === 'therapist' ? 'default' : 'outline'}
                  onClick={() => setUserRole('therapist')}
                  size="sm"
                >
                  Therapist
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter meeting ID (or use 'demo-meeting-1')"
                value={customMeetingId}
                onChange={(e) => setCustomMeetingId(e.target.value)}
              />
              <Button onClick={handleJoinCustomMeeting} disabled={!customMeetingId.trim()}>
                Join Meeting
              </Button>
            </div>

            <Button
              onClick={handleCreateTestMeeting}
              className="w-full"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo Meeting (Live Session)
            </Button>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>WebRTC peer-to-peer video calling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time video/audio controls</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Screen sharing capabilities</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Session recording (WebM format)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile responsive design</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>TURN/STUN server support</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Meeting scheduling & access control</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>In-meeting chat functionality</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Therapist session notes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time WebSocket events</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Waiting room & lobby experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cross-browser compatibility</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <MeetingAccess 
          meetings={mockMeetings} 
          userRole={userRole}
          isLoading={false}
        />

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                All video sessions use end-to-end WebRTC encryption. Meeting access is controlled 
                by authentication tokens, and only authorized participants can join sessions.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">HIPAA Compliant</div>
                <div className="text-green-600">Medical data protection</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">WebRTC Encrypted</div>
                <div className="text-blue-600">End-to-end security</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">Role-Based Access</div>
                <div className="text-purple-600">Controlled permissions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Demo Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Demo Meeting ID:</strong> demo-meeting-1 (currently "in progress")</p>
            <p>• <strong>WebRTC Stack:</strong> SimplePeer with Socket.io signaling</p>
            <p>• <strong>Video Codecs:</strong> VP9, H.264 fallback</p>
            <p>• <strong>Audio Codecs:</strong> Opus, G.722 fallback</p>
            <p>• <strong>TURN Server:</strong> Coturn with WebRTC NAT traversal</p>
            <p>• <strong>Recording:</strong> MediaRecorder API with WebM container</p>
            <p>• <strong>Browser Support:</strong> Chrome, Firefox, Safari, Edge</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}