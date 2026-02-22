import { X, Upload, FileText, Eye, Trash2, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { WorksheetCreateInputDto } from "@/types/api/worksheets";
import { useTherapistAuth } from "@/hooks/auth/therapist/useTherapistAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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
  const [dueTime, setDueTime] = useState("");
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<File[]>([]);
  const [materialErrors, setMaterialErrors] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setDueTime("");
      setSelectedPatient("");
      setMaterials([]);
      setMaterialErrors(null);
      setDateTimeError(null);
      toast.success("Worksheet created successfully!");
      onClose();
    },
    onError: (err: any) => {
      setSubmitting(false);
      setFormError(err?.message || "Failed to create worksheet");
    },
  });

  // File management functions
  const handleAddFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    });

    if (invalidFiles.length > 0) {
      setMaterialErrors(invalidFiles.join(', '));
    } else {
      setMaterialErrors(null);
    }

    // Add valid files to existing materials (avoiding duplicates)
    setMaterials(prev => {
      const existingNames = prev.map(f => f.name);
      const newFiles = validFiles.filter(f => !existingNames.includes(f.name));
      return [...prev, ...newFiles];
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed' };
    }

    return { isValid: true };
  };

  const handleRemoveFile = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
    setMaterialErrors(null);
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Validation function for date and time
  const validateDateTime = (dateStr: string, timeStr: string): { isValid: boolean; error?: string } => {
    if (!dateStr || !timeStr) {
      return { isValid: false, error: "Both date and time are required." };
    }

    const selectedDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      return { isValid: false, error: "Due date and time must be in the future." };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMaterialErrors(null);
    setDateTimeError(null);
    
    if (!title || !selectedPatient || !dueDate || !dueTime) {
      setFormError("Please fill in all required fields.");
      return;
    }
    
    // Validate date and time
    const dateTimeValidation = validateDateTime(dueDate, dueTime);
    if (!dateTimeValidation.isValid) {
      setDateTimeError(dateTimeValidation.error!);
      return;
    }
    
    if (!user?.id) {
      setFormError("Therapist ID not found. Please re-login.");
      return;
    }
    setSubmitting(true);
    // Convert dueDate and dueTime to ISO string
    const dueDateISO = new Date(`${dueDate}T${dueTime}`).toISOString();

    // Build FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('title', title);
    formData.append('instructions', instructions);
    formData.append('dueDate', dueDateISO);
    formData.append('userId', selectedPatient);
    formData.append('therapistId', user.id);
    materials.forEach(file => formData.append('files', file));

    // Use the API mutation, but pass FormData
    createWorksheetMutation.mutate(formData as any);
    // No need to log worksheetData, as it's now FormData
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileSelection}
          className="hidden"
        />

        <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Create New Worksheet
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Worksheet Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Worksheet Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter worksheet title"
                required
                disabled={submitting}
              />
            </div>

            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient">Assign to Patient *</Label>
              <select
                id="patient"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                disabled={patientsLoading || submitting}
                required
              >
                <option value="" disabled>
                  {patientsLoading ? "Loading patients..." : "Select a patient"}
                </option>
                {patients && patients.length > 0 && patients.map((patient: any) => (
                  <option key={patient.userId} value={String(patient.userId)}>
                    {patient.user.firstName + " " + patient.user.lastName || `Unnamed Patient (${patient.id})`}
                  </option>
                ))}
              </select>
              {patientsError && (
                <p className="text-red-500 text-sm">{patientsError}</p>
              )}
            </div>

            {/* Due Date and Time */}
            <div className="space-y-4">
              <Label>Due Date & Time *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm">Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={e => {
                      setDueDate(e.target.value);
                      setDateTimeError(null);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueTime" className="text-sm">Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={dueTime}
                    onChange={e => {
                      setDueTime(e.target.value);
                      setDateTimeError(null);
                    }}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              {dateTimeError && (
                <p className="text-red-500 text-sm">{dateTimeError}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                rows={4}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Provide instructions for the patient..."
                disabled={submitting}
              />
            </div>

            {/* Reference Materials */}
            <div className="space-y-3">
              <Label>Reference Materials</Label>
              
              {/* Add Files Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFiles}
                disabled={submitting}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reference Files
              </Button>

              {/* File List */}
              {materials.length > 0 && (
                <div className="space-y-2">
                  {materials.map((file, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFile(file)}
                              disabled={submitting}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {materialErrors && (
                <p className="text-red-500 text-sm">{materialErrors}</p>
              )}
            </div>

            {formError && (
              <p className="text-red-500 text-sm">{formError}</p>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Worksheet"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
