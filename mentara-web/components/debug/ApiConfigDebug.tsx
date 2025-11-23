"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";

export function ApiConfigDebug() {
  const [config, setConfig] = useState<{
    baseURL: string;
    expected: string;
    match: boolean;
    backendReachable: boolean;
  } | null>(null);

  useEffect(() => {
    const checkConfig = async () => {
      const baseURL = apiClient.defaults.baseURL || "unknown";
      const expected = "http://localhost:3001/api";
      const match = baseURL === expected;

      // Test backend connection
      let backendReachable = false;
      try {
        const response = await fetch(`${baseURL}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        backendReachable = response.ok;
      } catch (error) {
        backendReachable = false;
      }

      setConfig({
        baseURL,
        expected,
        match,
        backendReachable,
      });
    };

    checkConfig();
  }, []);

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Base URL:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {config.baseURL}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Expected:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {config.expected}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">URL Match:</span>
          <Badge variant={config.match ? "default" : "destructive"}>
            {config.match ? "✅ Correct" : "❌ Mismatch"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backend Reachable:</span>
          <Badge variant={config.backendReachable ? "default" : "destructive"}>
            {config.backendReachable ? "✅ Yes" : "❌ No"}
          </Badge>
        </div>
        {!config.match && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ API URL mismatch! Expected: {config.expected}, Got:{" "}
              {config.baseURL}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Check your NEXT_PUBLIC_API_URL environment variable
            </p>
          </div>
        )}
        {!config.backendReachable && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ Cannot reach backend at {config.baseURL}
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Make sure the backend server is running on port 3001
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

