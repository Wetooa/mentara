"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  FileText,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TreatmentNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (notes: TreatmentNote) => void;
  sessionId?: string;
  patientId: string;
  existingNotes?: TreatmentNote | null;
}

interface TreatmentNote {
  id?: string;
  sessionId: string;
  patientId: string;
  sessionDate: string;
  sessionNumber: number;
  sessionDuration: number;
  presentingConcerns: string;
  interventionsUsed: string[];
  patientResponse: string;
  homework: string;
  progressNotes: string;
  riskAssessment: RiskAssessment;
  treatmentGoals: TreatmentGoal[];
  nextSteps: string;
  therapistObservations: string;
  mood: MoodRating;
  anxiety: MoodRating;
  functioning: MoodRating;
  engagement: MoodRating;
}

interface RiskAssessment {
  suicidalIdeation: "none" | "passive" | "active" | "plan";
  homicidalIdeation: "none" | "present";
  selfHarm: "none" | "risk" | "recent";
  substanceUse: "none" | "concern" | "significant";
  notes: string;
}

interface TreatmentGoal {
  id: string;
  goal: string;
  progress: "not-started" | "minimal" | "moderate" | "significant" | "achieved";
  notes: string;
}

interface MoodRating {
  rating: number; // 1-10 scale
  notes: string;
}

const INTERVENTION_OPTIONS = [
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Mindfulness-Based Therapy",
  "Psychoeducation",
  "Exposure Therapy",
  "Relaxation Techniques",
  "Problem-Solving Therapy",
  "Interpersonal Therapy",
  "Acceptance and Commitment Therapy (ACT)",
  "Trauma-Focused Therapy",
];

const PROGRESS_OPTIONS = [
  { value: "not-started", label: "Not Started", color: "bg-gray-100 text-gray-800" },
  { value: "minimal", label: "Minimal Progress", color: "bg-red-100 text-red-800" },
  { value: "moderate", label: "Moderate Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "significant", label: "Significant Progress", color: "bg-blue-100 text-blue-800" },
  { value: "achieved", label: "Goal Achieved", color: "bg-green-100 text-green-800" },
];

export default function TreatmentNotesModal({
  isOpen,
  onClose,
  onSave,
  sessionId = "",
  patientId,
  existingNotes,
}: TreatmentNotesModalProps) {
  const [formData, setFormData] = useState<TreatmentNote>({
    sessionId,
    patientId,
    sessionDate: new Date().toISOString().split('T')[0],
    sessionNumber: 1,
    sessionDuration: 60,
    presentingConcerns: "",
    interventionsUsed: [],
    patientResponse: "",
    homework: "",
    progressNotes: "",
    riskAssessment: {
      suicidalIdeation: "none",
      homicidalIdeation: "none",
      selfHarm: "none",
      substanceUse: "none",
      notes: "",
    },
    treatmentGoals: [],
    nextSteps: "",
    therapistObservations: "",
    mood: { rating: 5, notes: "" },
    anxiety: { rating: 5, notes: "" },
    functioning: { rating: 5, notes: "" },
    engagement: { rating: 5, notes: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingNotes) {
      setFormData(existingNotes);
    }
  }, [existingNotes]);

  const addTreatmentGoal = () => {
    const newGoal: TreatmentGoal = {
      id: Date.now().toString(),
      goal: "",
      progress: "not-started",
      notes: "",
    };
    setFormData(prev => ({
      ...prev,
      treatmentGoals: [...prev.treatmentGoals, newGoal],
    }));
  };

  const updateTreatmentGoal = (id: string, updates: Partial<TreatmentGoal>) => {
    setFormData(prev => ({
      ...prev,
      treatmentGoals: prev.treatmentGoals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      ),
    }));
  };

  const removeTreatmentGoal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      treatmentGoals: prev.treatmentGoals.filter(goal => goal.id !== id),
    }));
  };

  const toggleIntervention = (intervention: string) => {
    setFormData(prev => ({
      ...prev,
      interventionsUsed: prev.interventionsUsed.includes(intervention)
        ? prev.interventionsUsed.filter(i => i !== intervention)
        : [...prev.interventionsUsed, intervention],
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Basic validation
      if (!formData.presentingConcerns.trim()) {
        setError("Presenting concerns is required");
        return;
      }

      await onSave?.(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save treatment notes");
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (rating: number) => {
    if (rating <= 3) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (rating <= 7) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Treatment Notes - Session {formData.sessionNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sessionDate">Session Date</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sessionNumber">Session Number</Label>
                <Input
                  id="sessionNumber"
                  type="number"
                  value={formData.sessionNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionNumber: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="sessionDuration">Duration (minutes)</Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  value={formData.sessionDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) || 60 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Presenting Concerns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presenting Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What issues or concerns did the patient present with in this session?"
                value={formData.presentingConcerns}
                onChange={(e) => setFormData(prev => ({ ...prev, presentingConcerns: e.target.value }))}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Interventions Used */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interventions Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERVENTION_OPTIONS.map((intervention) => (
                  <Badge
                    key={intervention}
                    variant={formData.interventionsUsed.includes(intervention) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2 text-xs"
                    onClick={() => toggleIntervention(intervention)}
                  >
                    {intervention}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Response & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Response</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How did the patient respond to interventions? What was their engagement level?"
                  value={formData.patientResponse}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientResponse: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Overall progress observations, changes since last session..."
                  value={formData.progressNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, progressNotes: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Mood & Functioning Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Ratings (1-10 scale)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "mood", label: "Mood" },
                { key: "anxiety", label: "Anxiety Level" },
                { key: "functioning", label: "Daily Functioning" },
                { key: "engagement", label: "Session Engagement" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{label}</Label>
                    {getMoodIcon(formData[key as keyof typeof formData].rating)}
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={formData[key as keyof typeof formData].rating}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [key]: { ...prev[key as keyof typeof prev], rating: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium">
                    {formData[key as keyof typeof formData].rating}/10
                  </div>
                  <Textarea
                    placeholder={`${label} notes...`}
                    value={formData[key as keyof typeof formData].notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [key]: { ...prev[key as keyof typeof prev], notes: e.target.value }
                    }))}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Treatment Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Treatment Goals</CardTitle>
                <Button size="sm" onClick={addTreatmentGoal} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.treatmentGoals.map((goal, index) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium">Goal {index + 1}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTreatmentGoal(goal.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Goal Description</Label>
                      <Textarea
                        value={goal.goal}
                        onChange={(e) => updateTreatmentGoal(goal.id, { goal: e.target.value })}
                        placeholder="Describe the treatment goal..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Progress Status</Label>
                        <Select
                          value={goal.progress}
                          onValueChange={(value) => updateTreatmentGoal(goal.id, { progress: value as TreatmentGoal['progress'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROGRESS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={option.color}>
                                    {option.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Progress Notes</Label>
                        <Textarea
                          value={goal.notes}
                          onChange={(e) => updateTreatmentGoal(goal.id, { notes: e.target.value })}
                          placeholder="Notes on progress toward this goal..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {formData.treatmentGoals.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No treatment goals added yet. Click &quot;Add Goal&quot; to create one.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: "suicidalIdeation", label: "Suicidal Ideation", options: ["none", "passive", "active", "plan"] },
                  { key: "homicidalIdeation", label: "Homicidal Ideation", options: ["none", "present"] },
                  { key: "selfHarm", label: "Self-Harm Risk", options: ["none", "risk", "recent"] },
                  { key: "substanceUse", label: "Substance Use", options: ["none", "concern", "significant"] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Select
                      value={formData.riskAssessment[key as keyof RiskAssessment] as string}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        riskAssessment: { ...prev.riskAssessment, [key]: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div>
                <Label>Risk Assessment Notes</Label>
                <Textarea
                  value={formData.riskAssessment.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    riskAssessment: { ...prev.riskAssessment, notes: e.target.value }
                  }))}
                  placeholder="Additional risk assessment notes, safety planning, etc..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Homework & Next Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Homework Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What homework or activities should the patient work on before the next session?"
                  value={formData.homework}
                  onChange={(e) => setFormData(prev => ({ ...prev, homework: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What are the planned next steps for treatment?"
                  value={formData.nextSteps}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Therapist Observations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Therapist Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Clinical observations, patient's presentation, therapeutic alliance, etc..."
                value={formData.therapistObservations}
                onChange={(e) => setFormData(prev => ({ ...prev, therapistObservations: e.target.value }))}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Treatment Notes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}