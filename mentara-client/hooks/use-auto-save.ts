import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import useTherapistForm from "@/store/therapistform";

interface UseAutoSaveProps {
  control: any;
  interval?: number; // Auto-save interval in milliseconds (default: 30 seconds)
  debounceMs?: number; // Debounce time in milliseconds (default: 2 seconds)
}

export const useAutoSave = ({ 
  control, 
  interval = 30000, // 30 seconds
  debounceMs = 2000  // 2 seconds
}: UseAutoSaveProps) => {
  const {
    updateField,
    saveFormData,
    setAutoSaving,
    autoSaveEnabled,
    lastSaved,
    isAutoSaving,
  } = useTherapistForm();

  const watchedValues = useWatch({ control });
  const debounceTimer = useRef<NodeJS.Timeout>();
  const autoSaveTimer = useRef<NodeJS.Timeout>();
  const lastSaveTime = useRef<Date | null>(null);

  // Debounced save function
  const debouncedSave = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (autoSaveEnabled && !isAutoSaving) {
        setAutoSaving(true);
        
        // Update store with current form values
        Object.keys(watchedValues || {}).forEach((key) => {
          if (watchedValues[key] !== undefined) {
            updateField(key, watchedValues[key]);
          }
        });

        // Mark as saved
        saveFormData();
        lastSaveTime.current = new Date();
      }
    }, debounceMs);
  };

  // Auto-save on interval
  useEffect(() => {
    if (!autoSaveEnabled) return;

    autoSaveTimer.current = setInterval(() => {
      const now = new Date();
      const shouldSave = !lastSaveTime.current || 
        (now.getTime() - lastSaveTime.current.getTime()) >= interval;

      if (shouldSave && !isAutoSaving) {
        debouncedSave();
      }
    }, interval);

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [autoSaveEnabled, interval, isAutoSaving]);

  // Save on form changes (debounced)
  useEffect(() => {
    if (watchedValues && autoSaveEnabled) {
      debouncedSave();
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [watchedValues, autoSaveEnabled]);

  // Manual save function
  const manualSave = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    setAutoSaving(true);
    
    // Update store with current form values
    Object.keys(watchedValues || {}).forEach((key) => {
      if (watchedValues[key] !== undefined) {
        updateField(key, watchedValues[key]);
      }
    });

    saveFormData();
    lastSaveTime.current = new Date();
  };

  // Get time since last save
  const getTimeSinceLastSave = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = now.getTime() - new Date(lastSaved).getTime();
    
    if (diff < 60000) {
      return `${Math.floor(diff / 1000)} seconds ago`;
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else {
      return `${Math.floor(diff / 3600000)} hours ago`;
    }
  };

  return {
    manualSave,
    isAutoSaving,
    autoSaveEnabled,
    lastSaved,
    getTimeSinceLastSave,
  };
};