"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/lib/api';
import { hasAuthToken, getAuthToken } from '@/lib/constants/auth';
import { useTherapistProfile } from '@/hooks/therapist';

export function TherapistApiDebug() {
  const [testTherapistId, setTestTherapistId] = useState('');
  const [manualResult, setManualResult] = useState<any>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [isManualLoading, setIsManualLoading] = useState(false);
  
  const api = useApi();
  
  // Use the hook for comparison
  const {
    data: hookResult,
    isLoading: hookLoading,
    error: hookError,
  } = useTherapistProfile(testTherapistId, !!testTherapistId);

  const handleManualTest = async () => {
    if (!testTherapistId.trim()) return;
    
    setIsManualLoading(true);
    setManualResult(null);
    setManualError(null);
    
    try {
      console.log('Manual API test starting for therapist ID:', testTherapistId);
      const result = await api.therapists.getTherapistProfile(testTherapistId);
      console.log('Manual API test result:', result);
      setManualResult(result);
    } catch (error: any) {
      console.error('Manual API test error:', error);
      setManualError(error?.message || 'Unknown error occurred');
    } finally {
      setIsManualLoading(false);
    }
  };

  const authStatus = hasAuthToken();
  const token = getAuthToken();

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Therapist API Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div>
            <Label>Authentication Status</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={authStatus ? "default" : "destructive"}>
                {authStatus ? "Token Available" : "No Token"}
              </Badge>
              {token && (
                <span className="text-xs text-muted-foreground">
                  Token: {token.substring(0, 20)}...
                </span>
              )}
            </div>
          </div>

          {/* Test Input */}
          <div>
            <Label htmlFor="therapistId">Test Therapist ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="therapistId"
                value={testTherapistId}
                onChange={(e) => setTestTherapistId(e.target.value)}
                placeholder="Enter therapist user ID"
              />
              <Button onClick={handleManualTest} disabled={isManualLoading}>
                {isManualLoading ? 'Testing...' : 'Test API'}
              </Button>
            </div>
          </div>

          {/* Manual API Test Results */}
          <div>
            <Label>Manual API Test Results</Label>
            {manualError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>
                  <strong>Error:</strong> {manualError}
                </AlertDescription>
              </Alert>
            )}
            {manualResult && (
              <Alert className="mt-2">
                <AlertDescription>
                  <strong>Success:</strong> Found therapist "{manualResult.name}" 
                  (Rate: ${manualResult.hourlyRate}/hr, Rating: {manualResult.rating})
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Hook Test Results */}
          <div>
            <Label>React Query Hook Results</Label>
            {hookLoading && (
              <Badge variant="secondary" className="mt-2">Loading via hook...</Badge>
            )}
            {hookError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>
                  <strong>Hook Error:</strong> {hookError.message}
                </AlertDescription>
              </Alert>
            )}
            {hookResult && (
              <Alert className="mt-2">
                <AlertDescription>
                  <strong>Hook Success:</strong> Found therapist "{hookResult.name}"
                  (Rate: ${hookResult.hourlyRate}/hr, Rating: {hookResult.rating})
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Sample Therapist IDs */}
          <div>
            <Label>Quick Test IDs</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestTherapistId('test-therapist-id')}
              >
                test-therapist-id
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestTherapistId('sample-therapist')}
              >
                sample-therapist
              </Button>
            </div>
          </div>

          {/* API Configuration */}
          <div>
            <Label>API Configuration</Label>
            <div className="text-sm text-muted-foreground mt-1">
              <div>Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}</div>
              <div>Expected endpoint: GET /therapists/{'{id}'}</div>
              <div>Auth required: Yes (Bearer token)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}