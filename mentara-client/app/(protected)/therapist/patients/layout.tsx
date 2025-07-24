"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, RefreshCw, AlertCircle, Users, Clock, MessageCircle, Calendar, UserX, UserCheck, Eye, UserMinus } from "lucide-react";
import { usePatientsList, usePatientsRequests, useAcceptPatientRequest, useDenyPatientRequest, useRemovePatient } from "@/hooks/therapist/usePatientsList";
import AppointmentCalendar from "@/components/calendar-02";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const api = useApi();
  
  // Fetch data using the hooks
  const { data: myPatients, isLoading: loadingPatients, error: patientsError, refetch: refetchPatients } = usePatientsList();
  const { data: patientRequests, isLoading: loadingRequests, error: requestsError, refetch: refetchRequests } = usePatientsRequests();
  
  // Mutations
  const acceptRequest = useAcceptPatientRequest();
  const denyRequest = useDenyPatientRequest();
  const removePatient = useRemovePatient();
  
  // Fetch meetings/appointments for calendar
  const { data: meetingsData } = useQuery({
    queryKey: ['meetings', 'upcoming'],
    queryFn: () => api.meetings.getUpcomingMeetings(50),
    staleTime: 5 * 60 * 1000,
  });
  
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
        {/* Availability button */}
        <div className="p-3 border-b border-gray-200">
          <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
            <span>Availability</span>
          </Button>
        </div>

        {/* Calendar section */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-amber-800">Appointments</h3>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              {meetingsData?.meetings?.length || 0}
            </span>
