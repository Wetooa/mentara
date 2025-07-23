import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { WorksheetCreateInputDto } from "@/types/api/worksheets";
import { useTherapistAuth } from "@/hooks/auth/therapist/useTherapistAuth";

interface CreateWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWorksheetModal({
  isOpen,
  onClose,
}: CreateWorksheetModalProps) {
  const api = useApi();
  const { user } = useTherapistAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch patients directly from API service
  useEffect(() => {
    if (!isOpen) return;
    setPatientsLoading(true);
    setPatientsError(null);
    api.therapists.patients.getList()
      .then((data: any[]) => {
        setPatients(data || []);
        setPatientsLoading(false);
        console.log('Fetched patients:', data);
      })
      .catch((err: any) => {
        setPatientsError(err?.message || "Failed to load patients");
        setPatientsLoading(false);
      });
  }, [isOpen]);

  // Worksheet creation mutation
  const createWorksheetMutation = useMutation({
    mutationFn: async (data: WorksheetCreateInputDto) => {
      return await api.worksheets.create(data);
    },
    onSuccess: () => {
      setSubmitting(false);
      setFormError(null);
      setTitle("");
      setInstructions("");
      setDueDate("");
      setSelectedPatient("");
      onClose();
    },
    onError: (err: any) => {
      setSubmitting(false);
      setFormError(err?.message || "Failed to create worksheet");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title || !selectedPatient || !dueDate) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!user?.id) {
      setFormError("Therapist ID not found. Please re-login.");
      return;
    }
    setSubmitting(true);
    // Convert dueDate (YYYY-MM-DD) to ISO string (UTC midnight)
    const dueDateISO = new Date(dueDate + 'T00:00:00Z').toISOString();
    const worksheetData: WorksheetCreateInputDto = {
      title,
      instructions,
      dueDate: dueDateISO,
      userId: selectedPatient,
      therapistId: user.id,
      // materials: [] // Add if/when file upload is implemented
    };
    createWorksheetMutation.mutate(worksheetData);
    console.log('Worksheet data:', worksheetData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Create New Worksheet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
            disabled={submitting}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Worksheet Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Worksheet Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                  placeholder="Enter worksheet title"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Patient Selection */}
              <div>
                <label
                  htmlFor="patient"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assign to Patient *
                </label>
                <select
                  id="patient"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                  value={selectedPatient}
                  onChange={e => {
                    setSelectedPatient(e.target.value);
                    console.log('Selected patient:', e.target.value);
                  }}
                  disabled={patientsLoading || submitting}
                  required
                >
                  <option value="" disabled>{patientsLoading ? "Loading patients..." : "Select a patient"}</option>
                  {patients && patients.length > 0 && patients.map((patient: any) => (
                    <option key={patient.userId} value={String(patient.userId)}>
                      {patient.user.firstName + " " + patient.user.lastName || `Unnamed Patient (${patient.id})`}
                    </option>
                  ))}
                </select>
                {patientsError && <div className="text-red-500 text-xs mt-1">{patientsError}</div>}
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Instructions */}
              <div>
                <label
                  htmlFor="instructions"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  rows={4}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:border-transparent"
                  placeholder="Provide instructions for the patient..."
                  disabled={submitting}
                ></textarea>
              </div>

              {/* Reference Materials (not implemented) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Materials
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 sm:p-6 flex flex-col items-center">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 text-center">
                    Drag and drop files here, or click to select files
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                  <button
                    type="button"
                    className="mt-3 sm:mt-4 px-3 py-2 sm:px-4 sm:py-2 bg-[#129316]/15 text-[#436B00] rounded-md hover:bg-[#129316]/20 focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:ring-offset-2 text-sm"
                    disabled
                  >
                    Select Files
                  </button>
                </div>
              </div>
            </div>

            {formError && <div className="text-red-500 text-sm mt-4">{formError}</div>}

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="order-2 sm:order-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:ring-offset-2"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="order-1 sm:order-2 px-4 py-2 bg-[#436B00] text-white rounded-md hover:bg-[#129316] focus:outline-none focus:ring-2 focus:ring-[#436B00] focus:ring-offset-2"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Worksheet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
