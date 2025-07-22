"use client";

import React, { useState } from "react";
import { WorksheetManagementPage } from "@/components/therapist/worksheets/WorksheetManagementPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorksheetsSidebar from "@/components/worksheets/TherapistWorksheetsSidebar";
import TherapistWorksheetsList from "@/components/worksheets/TherapistWorksheetsList";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

export default function TherapistWorksheetsPage() {
  const [viewMode, setViewMode] = useState<'enhanced' | 'classic'>('enhanced');

  if (viewMode === 'enhanced') {
    return (
      <div className="min-h-screen">
        {/* View Toggle */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Worksheet Management</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'enhanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('enhanced')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Enhanced View
              </Button>
              <Button
                variant={viewMode === 'classic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('classic')}
              >
                <List className="h-4 w-4 mr-2" />
                Classic View
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Worksheet Management */}
        <WorksheetManagementPage />
      </div>
    );
  }

  // Classic view - use existing implementation
  return <ClassicWorksheetView onSwitchView={() => setViewMode('enhanced')} />;
}

// Separate component for classic view to keep existing functionality
function ClassicWorksheetView({ onSwitchView }: { onSwitchView: () => void }) {
  const [activeFilter, setActiveFilter] = useState<string>("everything");
  const [patientFilter, setPatientFilter] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <div className="min-h-screen">
      {/* View Toggle */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Worksheet Management</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchView}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Enhanced View
            </Button>
            <Button
              variant="default"
              size="sm"
            >
              <List className="h-4 w-4 mr-2" />
              Classic View
            </Button>
          </div>
        </div>
      </div>
      
      {/* Classic Interface */}
      <div className="flex h-full min-h-screen overflow-hidden">
        <WorksheetsSidebar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          patientFilter={patientFilter}
          setPatientFilter={setPatientFilter}
        />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <LayoutGrid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Classic View Available</h3>
            <p className="text-muted-foreground mb-4">
              The classic worksheet interface is available but we recommend using the enhanced view for Module 2 features.
            </p>
            <Button onClick={onSwitchView}>
              Switch to Enhanced View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
