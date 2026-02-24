"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";

const packageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description is too long"),
  sessionCount: z.coerce.number().min(1, "Must have at least 1 session").max(100, "Too many sessions"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  validityDays: z.coerce.number().min(1, "Must be valid for at least 1 day").max(365, "Maximum validity is 1 year"),
  features: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty") }))
    .min(1, "Add at least one feature"),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface CreatePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePackageDialog({ open, onOpenChange, onSuccess }: CreatePackageDialogProps) {
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: "",
      description: "",
      sessionCount: 4,
      price: 0,
      validityDays: 30,
      features: [{ value: "1-on-1 Therapy Session" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const onSubmit = async (data: PackageFormValues) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        features: data.features.map(f => f.value),
      };

      await api.packages.createPackage(payload);
      
      toast.success("Package created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create package:", error);
      toast.error("Failed to create package. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
          <DialogDescription>
            Offer bundled therapy sessions to your clients at a combined rate.
            Packages will require admin approval before they become visible to clients.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 4-Session Growth Bundle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what's included and who this is for..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Sessions</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Price (PHP)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="validityDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validity Period (Days)</FormLabel>
                  <FormDescription>How long clients have to use all sessions</FormDescription>
                  <FormControl>
                    <Input type="number" min={1} max={365} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Features Included</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ value: "" })}
                  className="h-8 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Feature
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`features.${index}.value`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input placeholder="e.g., 24/7 Chat Support" {...inputField} />
                          {fields.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Package'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
