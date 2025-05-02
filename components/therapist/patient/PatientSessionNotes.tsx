import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";

interface Session {
  id: string;
  number: number;
  date: string;
  notes: string;
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

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <div>
      {sessions.map((session) => (
        <div key={session.id} className="mb-4">
          <div
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow cursor-pointer"
            onClick={() => toggleSession(session.id)}
          >
            <div className="font-medium">Session {session.number}</div>
            <button>
              {expandedSession === session.id ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          {expandedSession === session.id && (
            <div className="mt-2 bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Problem</h3>
                <button className="text-primary">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-700">{session.notes}</p>
            </div>
          )}
        </div>
      ))}

      {sessions.length === 0 && (
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500">No session notes available</p>
          <button className="mt-2 text-primary font-medium">
            Create new session note
          </button>
        </div>
      )}
    </div>
  );
}
