/**
 * Video Call Integration Test Component
 * 
 * This component can be temporarily added to the frontend to test
 * video call functionality end-to-end.
 * 
 * Usage: Add this component to a test page or admin panel
 */

'use client';

import React, { useState } from 'react';
import { useApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type {
  VideoRoomResponse,
  VideoCallStatus,
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto
} from 'mentara-commons';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

const VideoCallTestComponent: React.FC = () => {
  const api = useApi();
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Create Video Room
  const testCreateVideoRoom = async () => {
    if (!meetingId) {
      addResult({
        name: 'Create Video Room',
        status: 'error',
        message: 'Meeting ID is required'
      });
      return;
    }

    try {
      const createRoomData: CreateVideoRoomDto = {
        meetingId,
        roomType: 'video',
        maxParticipants: 2,
        enableRecording: false,
        enableChat: true,
      };

      const response: VideoRoomResponse = await api.meetings.createVideoRoom(meetingId, createRoomData);
      
      addResult({
        name: 'Create Video Room',
        status: 'success',
        message: `Room created successfully: ${response.roomId}`,
        data: response
      });
    } catch (error: any) {
      addResult({
        name: 'Create Video Room',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Test 2: Join Video Room as Client
  const testJoinAsClient = async () => {
    if (!meetingId) {
      addResult({
        name: 'Join as Client',
        status: 'error',
        message: 'Meeting ID is required'
      });
      return;
    }

    try {
      const response: VideoRoomResponse = await api.meetings.joinAsClient(meetingId);
      
      addResult({
        name: 'Join as Client',
        status: 'success',
        message: `Joined room successfully: ${response.roomId}`,
        data: response
      });
    } catch (error: any) {
      addResult({
        name: 'Join as Client',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Test 3: Join Video Room as Therapist
  const testJoinAsTherapist = async () => {
    if (!meetingId) {
      addResult({
        name: 'Join as Therapist',
        status: 'error',
        message: 'Meeting ID is required'
      });
      return;
    }

    try {
      const response: VideoRoomResponse = await api.meetings.joinAsTherapist(meetingId);
      
      addResult({
        name: 'Join as Therapist',
        status: 'success',
        message: `Joined room successfully: ${response.roomId}`,
        data: response
      });
    } catch (error: any) {
      addResult({
        name: 'Join as Therapist',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Test 4: Get Video Call Status
  const testGetVideoStatus = async () => {
    if (!meetingId) {
      addResult({
        name: 'Get Video Status',
        status: 'error',
        message: 'Meeting ID is required'
      });
      return;
    }

    try {
      const response: VideoCallStatus = await api.meetings.getVideoCallStatus(meetingId);
      
      addResult({
        name: 'Get Video Status',
        status: 'success',
        message: `Status: ${response.status}, Participants: ${response.participants.length}`,
        data: response
      });
    } catch (error: any) {
      addResult({
        name: 'Get Video Status',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Test 5: End Video Call
  const testEndVideoCall = async () => {
    if (!meetingId) {
      addResult({
        name: 'End Video Call',
        status: 'error',
        message: 'Meeting ID is required'
      });
      return;
    }

    try {
      await api.meetings.endCallWithSummary(meetingId, 300, ['Follow up next week']);
      
      addResult({
        name: 'End Video Call',
        status: 'success',
        message: 'Video call ended successfully'
      });
    } catch (error: any) {
      addResult({
        name: 'End Video Call',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Test 6: Test Custom Video Room Creation
  const testCustomVideoRoom = async () => {
    if (!meetingId) {
      addResult({
        name: 'Create Custom Video Room',
        status: 'error',
        message: 'Meeting ID is required'
      });
      return;
    }

    try {
      const customData: CreateVideoRoomDto = {
        meetingId,
        roomType: 'video',
        maxParticipants: 4,
        enableRecording: true,
        enableChat: false,
      };

      const response: VideoRoomResponse = await api.meetings.createVideoRoom(meetingId, customData);
      
      addResult({
        name: 'Create Custom Video Room',
        status: 'success',
        message: `Custom room created: ${response.roomId} (Recording: ${response.roomConfig.enableRecording})`,
        data: response
      });
    } catch (error: any) {
      addResult({
        name: 'Create Custom Video Room',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Test 7: Get Upcoming Meetings (to get valid meeting IDs)
  const testGetUpcomingMeetings = async () => {
    try {
      const meetings = await api.meetings.getUpcomingMeetings();
      
      if (meetings && meetings.length > 0) {
        const firstMeeting = meetings[0];
        setMeetingId(firstMeeting.id);
        addResult({
          name: 'Get Upcoming Meetings',
          status: 'success',
          message: `Found ${meetings.length} meetings. Set first meeting ID: ${firstMeeting.id}`,
          data: meetings
        });
      } else {
        addResult({
          name: 'Get Upcoming Meetings',
          status: 'success',
          message: 'No upcoming meetings found',
          data: []
        });
      }
    } catch (error: any) {
      addResult({
        name: 'Get Upcoming Meetings',
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  };

  // Run all tests sequentially
  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();

    const tests = [
      testGetUpcomingMeetings,
      testCreateVideoRoom,
      testJoinAsClient,
      testJoinAsTherapist,
      testGetVideoStatus,
      testCustomVideoRoom,
      testEndVideoCall,
    ];

    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      await test();
    }

    setIsLoading(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Call Integration Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="meetingId" className="block text-sm font-medium mb-2">
                Meeting ID
              </label>
              <Input
                id="meetingId"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="Enter meeting ID or use 'Get Meetings' button"
              />
            </div>
            <Button onClick={testGetUpcomingMeetings} variant="outline">
              Get Meetings
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={testCreateVideoRoom} size="sm">
              Create Room
            </Button>
            <Button onClick={testJoinAsClient} size="sm">
              Join as Client
            </Button>
            <Button onClick={testJoinAsTherapist} size="sm">
              Join as Therapist
            </Button>
            <Button onClick={testGetVideoStatus} size="sm">
              Get Status
            </Button>
            <Button onClick={testCustomVideoRoom} size="sm">
              Custom Room
            </Button>
            <Button onClick={testEndVideoCall} size="sm">
              End Call
            </Button>
            <Button onClick={runAllTests} disabled={isLoading} className="col-span-2">
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <Alert key={index} className="border-l-4 border-l-gray-200">
                  <AlertDescription>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <div className="flex-1">
                        <div className={`font-medium ${getStatusColor(result.status)}`}>
                          {result.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {result.message}
                        </div>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">
                              View Response Data
                            </summary>
                            <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Total Tests: {results.length} | 
                Passed: {results.filter(r => r.status === 'success').length} | 
                Failed: {results.filter(r => r.status === 'error').length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Authentication Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={async () => {
                try {
                  await api.auth.sendVerificationEmail();
                  addResult({
                    name: 'Send Verification Email',
                    status: 'success',
                    message: 'Verification email sent successfully'
                  });
                } catch (error: any) {
                  addResult({
                    name: 'Send Verification Email',
                    status: 'error',
                    message: error.response?.data?.message || error.message
                  });
                }
              }}
              size="sm"
            >
              Test Email Verification
            </Button>
            <Button 
              onClick={async () => {
                try {
                  await api.auth.requestPasswordReset({ email: 'test@example.com' });
                  addResult({
                    name: 'Request Password Reset',
                    status: 'success',
                    message: 'Password reset email sent successfully'
                  });
                } catch (error: any) {
                  addResult({
                    name: 'Request Password Reset',
                    status: 'error',
                    message: error.response?.data?.message || error.message
                  });
                }
              }}
              size="sm"
            >
              Test Password Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> This is a test component for verifying video call integration. 
          Some tests may fail if the meeting ID doesn't exist or isn't in the correct status. 
          Use the "Get Meetings" button to populate a valid meeting ID for testing.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VideoCallTestComponent;