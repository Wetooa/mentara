"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Users, Calendar, DollarSign, MapPin, Languages, Heart } from "lucide-react";

const preferencesSchema = z.object({
  genderPreference: z.enum(["no-preference", "male", "female", "non-binary"]),
  agePreference: z.enum(["no-preference", "younger", "similar", "older"]),
  languagePreferences: z.array(z.string()).optional(),
  treatmentApproaches: z.array(z.string()).min(1, "Please select at least one treatment approach"),
  sessionFormat: z.enum(["in-person", "video", "phone", "no-preference"]),
  sessionFrequency: z.enum(["weekly", "bi-weekly", "monthly", "as-needed"]),
  budgetRange: z.enum(["under-100", "100-150", "150-200", "200-plus", "insurance"]),
  locationPreference: z.string().optional(),
  availabilityPreference: z.array(z.string()).optional(),
  specialConsiderations: z.string().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const treatmentApproaches = [
  { id: "cbt", label: "Cognitive Behavioral Therapy (CBT)", description: "Focus on changing thought patterns" },
  { id: "dbt", label: "Dialectical Behavior Therapy (DBT)", description: "Skills for emotional regulation" },
  { id: "psychodynamic", label: "Psychodynamic Therapy", description: "Explore unconscious patterns" },
  { id: "humanistic", label: "Humanistic/Person-Centered", description: "Client-led, empathetic approach" },
  { id: "emdr", label: "EMDR", description: "Trauma-focused therapy" },
  { id: "family-systems", label: "Family Systems Therapy", description: "Focus on family dynamics" },
  { id: "mindfulness", label: "Mindfulness-Based Therapy", description: "Present-moment awareness" },
  { id: "solution-focused", label: "Solution-Focused Therapy", description: "Goal-oriented, brief therapy" },
];

const languages = [
  { id: "english", label: "English" },
  { id: "spanish", label: "Spanish" },
  { id: "french", label: "French" },
  { id: "german", label: "German" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "korean", label: "Korean" },
  { id: "arabic", label: "Arabic" },
  { id: "other", label: "Other" },
];

const availabilityOptions = [
  { id: "morning", label: "Morning (8AM - 12PM)" },
  { id: "afternoon", label: "Afternoon (12PM - 5PM)" },
  { id: "evening", label: "Evening (5PM - 8PM)" },
  { id: "weekends", label: "Weekends" },
];

export default function TherapistPreferencesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      genderPreference: "no-preference",
      agePreference: "no-preference",
      languagePreferences: ["english"],
      treatmentApproaches: [],
      sessionFormat: "no-preference",
      sessionFrequency: "weekly",
      budgetRange: "insurance",
      locationPreference: "",
      availabilityPreference: [],
      specialConsiderations: "",
    },
  });

  const watchedApproaches = form.watch("treatmentApproaches");
  const watchedLanguages = form.watch("languagePreferences") || [];
  const watchedAvailability = form.watch("availabilityPreference") || [];

  const onSubmit = async (data: PreferencesFormData) => {
    setIsSubmitting(true);
    try {
      // Store preferences data in localStorage for now
      localStorage.setItem("onboarding_preferences", JSON.stringify(data));
      
      toast({
        title: "Preferences saved!",
        description: "Your therapist preferences have been saved successfully.",
      });
      
      // Navigate to completion page
      router.push("/user/onboarding/complete");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproachToggle = (approachId: string) => {
    const current = form.getValues("treatmentApproaches");
    const updated = current.includes(approachId)
      ? current.filter(id => id !== approachId)
      : [...current, approachId];
    form.setValue("treatmentApproaches", updated);
  };

  const handleLanguageToggle = (langId: string) => {
    const current = form.getValues("languagePreferences") || [];
    const updated = current.includes(langId)
      ? current.filter(id => id !== langId)
      : [...current, langId];
    form.setValue("languagePreferences", updated);
  };

  const handleAvailabilityToggle = (availId: string) => {
    const current = form.getValues("availabilityPreference") || [];
    const updated = current.includes(availId)
      ? current.filter(id => id !== availId)
      : [...current, availId];
    form.setValue("availabilityPreference", updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Therapist Preferences
          </CardTitle>
          <CardDescription>
            Help us match you with the right therapist for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Gender Preference */}
              <FormField
                control={form.control}
                name="genderPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Therapist Gender Preference</FormLabel>
                    <FormDescription>
                      Do you have a preference for your therapist's gender?
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {[
                        { value: "no-preference", label: "No Preference" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "non-binary", label: "Non-Binary" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                            field.value === option.value
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age Preference */}
              <FormField
                control={form.control}
                name="agePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Therapist Age Preference</FormLabel>
                    <FormDescription>
                      Do you prefer a therapist in a certain age range?
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {[
                        { value: "no-preference", label: "No Preference" },
                        { value: "younger", label: "Younger (20s-30s)" },
                        { value: "similar", label: "Similar to Me" },
                        { value: "older", label: "Older (40s+)" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                            field.value === option.value
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Language Preferences */}
              <FormField
                control={form.control}
                name="languagePreferences"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Language Preferences
                    </FormLabel>
                    <FormDescription>
                      Select all languages you're comfortable speaking in therapy
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                      {languages.map((lang) => (
                        <div
                          key={lang.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            watchedLanguages.includes(lang.id)
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handleLanguageToggle(lang.id)}
                        >
                          <Checkbox
                            checked={watchedLanguages.includes(lang.id)}
                            onChange={() => handleLanguageToggle(lang.id)}
                          />
                          <span className="text-sm font-medium">{lang.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Treatment Approaches */}
              <FormField
                control={form.control}
                name="treatmentApproaches"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Treatment Approaches
                    </FormLabel>
                    <FormDescription>
                      Select the therapeutic approaches you're interested in
                    </FormDescription>
                    <div className="space-y-3 mt-4">
                      {treatmentApproaches.map((approach) => (
                        <div
                          key={approach.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            watchedApproaches.includes(approach.id)
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handleApproachToggle(approach.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={watchedApproaches.includes(approach.id)}
                              onChange={() => handleApproachToggle(approach.id)}
                              className="mt-1"
                            />
                            <div>
                              <div className="font-medium">{approach.label}</div>
                              <div className="text-sm text-gray-600">{approach.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Session Format */}
              <FormField
                control={form.control}
                name="sessionFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Format Preference</FormLabel>
                    <FormDescription>
                      How would you prefer to have your therapy sessions?
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {[
                        { value: "in-person", label: "In-Person" },
                        { value: "video", label: "Video Call" },
                        { value: "phone", label: "Phone Call" },
                        { value: "no-preference", label: "No Preference" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                            field.value === option.value
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Session Frequency */}
              <FormField
                control={form.control}
                name="sessionFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Session Frequency
                    </FormLabel>
                    <FormDescription>
                      How often would you like to have therapy sessions?
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {[
                        { value: "weekly", label: "Weekly" },
                        { value: "bi-weekly", label: "Bi-Weekly" },
                        { value: "monthly", label: "Monthly" },
                        { value: "as-needed", label: "As Needed" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                            field.value === option.value
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget Range */}
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget Range
                    </FormLabel>
                    <FormDescription>
                      What's your budget range per session?
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {[
                        { value: "under-100", label: "Under $100 per session" },
                        { value: "100-150", label: "$100 - $150 per session" },
                        { value: "150-200", label: "$150 - $200 per session" },
                        { value: "200-plus", label: "$200+ per session" },
                        { value: "insurance", label: "Using insurance coverage" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            field.value === option.value
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Availability Preference */}
              <FormField
                control={form.control}
                name="availabilityPreference"
                render={() => (
                  <FormItem>
                    <FormLabel>Availability Preference</FormLabel>
                    <FormDescription>
                      When are you typically available for sessions?
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {availabilityOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            watchedAvailability.includes(option.id)
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handleAvailabilityToggle(option.id)}
                        >
                          <Checkbox
                            checked={watchedAvailability.includes(option.id)}
                            onChange={() => handleAvailabilityToggle(option.id)}
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Special Considerations */}
              <FormField
                control={form.control}
                name="specialConsiderations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Considerations (Optional)</FormLabel>
                    <FormDescription>
                      Any other preferences or requirements for your therapist?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., experience with specific issues, cultural background, LGBTQ+ affirming..."
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
                  onClick={() => router.push("/user/onboarding/goals")}
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
                    "Complete Setup"
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