"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, RefreshCw, AlertCircle, Users, Clock, MessageCircle, Calendar, UserX, UserCheck, Eye, UserMinus } from "lucide-react";
import { usePatientsList, usePatientsRequests, useAcceptPatientRequest, useDenyPatientRequest, useRemovePatient } from "@/hooks/therapist/usePatientsList";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Fetch data using the hooks
  const { data: myPatients, isLoading: loadingPatients, error: patientsError, refetch: refetchPatients } = usePatientsList();
  const { data: patientRequests, isLoading: loadingRequests, error: requestsError, refetch: refetchRequests } = usePatientsRequests();
  
  // Mutations
  const acceptRequest = useAcceptPatientRequest();
  const denyRequest = useDenyPatientRequest();
  const removePatient = useRemovePatient();
  
  // Local state for search
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter functions
  const filterBySearch = (patients: any[], query: string) => {
    if (!query) return patients;
    return patients.filter((patient: any) => {
      const name = `${patient.user?.firstName || ''} ${patient.user?.lastName || ''}`.toLowerCase();
      const email = patient.user?.email?.toLowerCase() || '';
      return name.includes(query.toLowerCase()) || email.includes(query.toLowerCase());
    });
  };
  
  // Filtered data
  const filteredPatients = filterBySearch(myPatients || [], searchQuery);
  const filteredRequests = filterBySearch(patientRequests || [], searchQuery);
  
  // Action handlers
  const handleAcceptRequest = async (patientId: string, patientName: string) => {
    try {
      await acceptRequest.mutateAsync(patientId);
      toast.success(`Accepted request from ${patientName}`);
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };
  
  const handleDenyRequest = async (patientId: string, patientName: string) => {
    try {
      await denyRequest.mutateAsync(patientId);
      toast.success(`Denied request from ${patientName}`);
    } catch (error) {
      toast.error('Failed to deny request');
    }
  };
  
  const handleRemovePatient = async (patientId: string, patientName: string) => {
    try {
      await removePatient.mutateAsync(patientId);
      toast.success(`Removed ${patientName} from your patients`);
    } catch (error) {
      toast.error('Failed to remove patient');
    }
  };
  
  const refreshData = () => {
    refetchPatients();
    refetchRequests();
  };
  
  // Check if a patient is selected
  const isPatientSelected = pathname.split("/").length > 3;
  
  // Patient Card Components
  const MyPatientCard = ({ patient }: { patient: any }) => {
    const isActive = pathname.includes(`/patients/${patient.userId}`);
    const patientName = `${patient.user?.firstName || ''} ${patient.user?.lastName || ''}`;
    
    return (
      <div className={`p-3 rounded-lg border mb-3 ${isActive ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={patient.user?.profilePicture || "/avatar-placeholder.png"}
              alt={patientName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{patientName}</h4>
            <p className="text-xs text-gray-500">{patient.user?.email}</p>
            <p className="text-xs text-gray-400">Active since {new Date(patient.assignedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href={`/therapist/patients/${patient.userId}`}>
            <Button size="sm" variant="outline" className="text-xs h-7">
              <Eye className="w-3 h-3 mr-1" />
              View Profile
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="text-xs h-7">
            <MessageCircle className="w-3 h-3 mr-1" />
            Message
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            <Calendar className="w-3 h-3 mr-1" />
            Schedule
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-7 text-red-600 hover:text-red-700"
            onClick={() => handleRemovePatient(patient.userId, patientName)}
            disabled={removePatient.isPending}
          >
            <UserMinus className="w-3 h-3 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    );
  };
  
  const PatientRequestCard = ({ request }: { request: any }) => {
    const patientName = `${request.user?.firstName || ''} ${request.user?.lastName || ''}`;
    
    return (
      <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-200 mb-3">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={request.user?.profilePicture || "/avatar-placeholder.png"}
              alt={patientName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{patientName}</h4>
            <p className="text-xs text-gray-500">{request.user?.email}</p>
            <p className="text-xs text-gray-400">Requested {new Date(request.requestedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            className="text-xs h-7 bg-green-600 hover:bg-green-700"
            onClick={() => handleAcceptRequest(request.userId, patientName)}
            disabled={acceptRequest.isPending}
          >
            <UserCheck className="w-3 h-3 mr-1" />
            Accept
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-7 text-red-600 hover:text-red-700"
            onClick={() => handleDenyRequest(request.userId, patientName)}
            disabled={denyRequest.isPending}
          >
            <UserX className="w-3 h-3 mr-1" />
            Deny
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            <MessageCircle className="w-3 h-3 mr-1" />
            Message
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            <Eye className="w-3 h-3 mr-1" />
            View Profile
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
{/* Patients section with tabs */}
        <div className="p-3 flex-1 overflow-hidden flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Patients</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshData}
              className="p-1.5"
              disabled={loadingPatients || loadingRequests}
            >
              <RefreshCw className={`h-4 w-4 ${(loadingPatients || loadingRequests) ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* Error notifications */}
          {(patientsError || requestsError) && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <p className="text-xs text-yellow-800">Failed to load some data</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="patients" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="patients" className="text-xs">
                My Patients ({filteredPatients?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-xs">
                Requests ({filteredRequests?.length || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="patients" className="flex-1 overflow-y-auto mt-0">
              {loadingPatients ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mb-2" />
                </div>
              ) : filteredPatients?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No active patients</p>
                  <p className="text-xs text-gray-400">Accepted patient requests will appear here</p>
                </div>
              ) : (
                filteredPatients?.map((patient: any) => (
                  <MyPatientCard key={patient.userId} patient={patient} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="flex-1 overflow-y-auto mt-0">
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mb-2" />
                </div>
              ) : filteredRequests?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No pending requests</p>
                  <p className="text-xs text-gray-400">Patient connection requests will appear here</p>
                </div>
              ) : (
                filteredRequests?.map((request: any) => (
                  <PatientRequestCard key={request.userId} request={request} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {isPatientSelected ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-6">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Users size={48} className="text-primary" />
            </div>
            <h2 className="text-xl font-medium mb-2">Select a Patient</h2>
            <p className="text-gray-600 max-w-md">
              Choose a patient from the sidebar to view their profile, treatment plan, and session history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
