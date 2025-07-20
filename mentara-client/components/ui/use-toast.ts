import { toast } from "sonner";

// This hook provides a consistent interface for toast notifications
// using Sonner as the underlying implementation
export function useToast() {
  return {
    toast: (options: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      const { title, description, variant } = options;
      
      if (variant === "destructive") {
        toast.error(title || "Error", {
          description,
        });
      } else {
        toast.success(title || "Success", {
          description,
        });
      }
    },
  };
}