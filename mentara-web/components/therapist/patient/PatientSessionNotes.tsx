import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Plus, FileText, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TreatmentNotesModal from "./TreatmentNotesModal";

interface Session {
  id: string;
  number: number;
  date: string;
  notes: string;
  duration?: number;
  status?: string;
  meetingType?: string;
}

interface PatientSessionNotesProps {
  sessions: Session[];
  patientId: string;
}

export default function PatientSessionNotes({
  sessions,
  patientId,
}: PatientSessionNotesProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(
    sessions.length > 0 ? sessions[0].id : null
  );
  const [isTreatmentNotesModalOpen, setIsTreatmentNotesModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const openTreatmentNotes = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsTreatmentNotesModalOpen(true);
  };

  const createNewTreatmentNote = () => {
    setSelectedSessionId(null);
    setIsTreatmentNotesModalOpen(true);
  };

  const handleSaveTreatmentNotes = (notes: unknown) => {
    // In a real implementation, this would save to the backend
    console.log('Saving treatment notes:', notes);
    setIsTreatmentNotesModalOpen(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-200 text-blue-800">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-200 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Create New Note Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Session Notes</h3>
        <Button 
          onClick={createNewTreatmentNote}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Treatment Note
        </Button>
      </div>

      {/* Sessions List */}
      {sessions.map((session) => (
        <div key={session.id} className="border rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between bg-white p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSession(session.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Session {session.number}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(session.date)}</span>
                {session.duration && <span>• {session.duration} min</span>}
              </div>
              {getStatusBadge(session.status)}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openTreatmentNotes(session.id);
                }}
                className="flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                Treatment Notes
              </Button>
              <button>
                {expandedSession === session.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {expandedSession === session.id && (
            <div className="border-t bg-gray-50 p-4">
              <div className="space-y-4">
                {/* Session Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm">{formatDate(session.date)}</p>
                  </div>
                  {session.duration && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Duration</label>
                      <p className="text-sm">{session.duration} minutes</p>
                    </div>
                  )}
                  {session.meetingType && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm capitalize">{session.meetingType}</p>
                    </div>
                  )}
                </div>

                {/* Session Notes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Session Notes</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openTreatmentNotes(session.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    {session.notes ? (
                      <p className="text-gray-700 text-sm leading-relaxed">{session.notes}</p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No notes recorded for this session.</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openTreatmentNotes(session.id)}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    Detailed Notes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Session
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="rounded-full bg-gray-100 p-3">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">No session notes yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Start by creating your first treatment note for this patient.
              </p>
            </div>
            <Button onClick={createNewTreatmentNote} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create First Note
            </Button>
          </div>
        </div>
      )}

      {/* Treatment Notes Modal */}
      <TreatmentNotesModal
        isOpen={isTreatmentNotesModalOpen}
        onClose={() => setIsTreatmentNotesModalOpen(false)}
        onSave={handleSaveTreatmentNotes}
        sessionId={selectedSessionId || ""}
        patientId={patientId}
      />
    </div>
  );
}
