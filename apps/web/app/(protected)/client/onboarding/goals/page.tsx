"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Target, Brain, Heart, Users, Activity, Moon, Coffee } from "lucide-react";

const goalsSchema = z.object({
  treatmentGoals: z.array(z.string()).min(1, "Please select at least one treatment goal"),
  specificConcerns: z.string().optional(),
  previousTreatment: z.boolean().default(false),
  previousTreatmentDetails: z.string().optional(),
  urgencyLevel: z.enum(["low", "moderate", "high", "crisis"]),
  preferredOutcome: z.string().min(10, "Please describe your preferred outcome"),
  additionalNotes: z.string().optional(),
});

type GoalsFormData = z.infer<typeof goalsSchema>;

const treatmentGoalOptions = [
  { id: "anxiety", label: "Manage Anxiety", icon: Brain },
  { id: "depression", label: "Address Depression", icon: Heart },
  { id: "relationships", label: "Improve Relationships", icon: Users },
  { id: "stress", label: "Reduce Stress", icon: Activity },
  { id: "sleep", label: "Better Sleep", icon: Moon },
  { id: "self-esteem", label: "Build Self-Esteem", icon: Target },
  { id: "substance", label: "Substance Use Issues", icon: Coffee },
  { id: "trauma", label: "Process Trauma", icon: Heart },
  { id: "grief", label: "Grief & Loss", icon: Heart },
  { id: "life-transitions", label: "Life Transitions", icon: Activity },
  { id: "work-stress", label: "Work-Related Stress", icon: Activity },
  { id: "family-issues", label: "Family Issues", icon: Users },
];

export default function GoalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema) as unknown as Resolver<GoalsFormData>,
    defaultValues: {
      treatmentGoals: [],
      specificConcerns: "",
      previousTreatment: false,
      previousTreatmentDetails: "",
      urgencyLevel: "moderate",
      preferredOutcome: "",
      additionalNotes: "",
    },
  });

  const watchedGoals = form.watch("treatmentGoals");
  const watchedPreviousTreatment = form.watch("previousTreatment");

  const onSubmit = async (data: GoalsFormData) => {
    setIsSubmitting(true);
    try {
      // Store goals data in localStorage for now
      // This will be replaced with actual API call later
      localStorage.setItem("onboarding_goals", JSON.stringify(data));
      
      toast({
        title: "Goals saved!",
        description: "Your treatment goals have been saved successfully.",
      });
      
      // Navigate to next step
      router.push("/client/onboarding/therapist-preferences");
    } catch {
      toast({
        title: "Error",
        description: "Failed to save goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    const currentGoals = form.getValues("treatmentGoals");
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(id => id !== goalId)
      : [...currentGoals, goalId];
    
    form.setValue("treatmentGoals", updatedGoals);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Treatment Goals & Concerns
          </CardTitle>
          <CardDescription>
            Help us understand what you hope to achieve through therapy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Treatment Goals */}
              <FormField
                control={form.control}
                name="treatmentGoals"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      What areas would you like to work on?
                    </FormLabel>
                    <FormDescription>
                      Select all that apply. This helps us match you with the right therapist.
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {treatmentGoalOptions.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = watchedGoals.includes(goal.id);
                        return (
                          <div
                            key={goal.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handleGoalToggle(goal.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleGoalToggle(goal.id)}
                            />
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{goal.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specific Concerns */}
              <FormField
                control={form.control}
                name="specificConcerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Concerns (Optional)</FormLabel>
                    <FormDescription>
                      Is there anything specific you&apos;d like to share about your current situation?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any specific situations, symptoms, or challenges you're facing..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Previous Treatment */}
              <div className="border-t pt-6">
                <FormField
                  control={form.control}
                  name="previousTreatment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I have received mental health treatment before
                        </FormLabel>
                        <FormDescription>
                          This helps us understand your treatment history
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchedPreviousTreatment && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="previousTreatmentDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Treatment Details</FormLabel>
                          <FormDescription>
                            Please share what types of treatment you&apos;ve tried and what worked or didn&apos;t work
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Individual therapy, group therapy, medication, specific approaches..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Urgency Level */}
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem className="border-t pt-6">
                    <FormLabel className="text-base font-medium">
                      How urgent is your need for support?
                    </FormLabel>
                    <FormDescription>
                      This helps us prioritize your care appropriately
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          field.value === "low"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => field.onChange("low")}
                      >
                        <div className="font-medium">Low Priority</div>
                        <div className="text-sm text-gray-600">
                          I&apos;m doing okay, just want to work on some things
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          field.value === "moderate"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => field.onChange("moderate")}
                      >
                        <div className="font-medium">Moderate Priority</div>
                        <div className="text-sm text-gray-600">
                          I&apos;m struggling but managing day-to-day life
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          field.value === "high"
                            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => field.onChange("high")}
                      >
                        <div className="font-medium">High Priority</div>
                        <div className="text-sm text-gray-600">
                          I&apos;m having significant difficulties
                        </div>
                      </div>
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          field.value === "crisis"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => field.onChange("crisis")}
                      >
                        <div className="font-medium">Crisis Level</div>
                        <div className="text-sm text-gray-600">
                          I need immediate support
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Outcome */}
              <FormField
                control={form.control}
                name="preferredOutcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What would success look like for you?</FormLabel>
                    <FormDescription>
                      Describe how you&apos;d like to feel or what you&apos;d like to be different after treatment
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I want to feel more confident, have better relationships, manage stress better..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormDescription>
                      Anything else you&apos;d like your therapist to know?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Any other information that might be helpful..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/client/onboarding/profile")}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}