"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock, Sun, Sunset, Moon, Calendar } from "lucide-react";

interface AvailabilityFilterProps {
  value: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    weekends: boolean;
  };
  onChange: (value: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    weekends: boolean;
  }) => void;
  className?: string;
}

export default function AvailabilityFilter({
  value,
  onChange,
  className = "",
}: AvailabilityFilterProps) {
  const handleChange = (timeSlot: keyof typeof value, checked: boolean) => {
    onChange({
      ...value,
      [timeSlot]: checked,
    });
  };

  const availabilityOptions = [
    {
      key: 'morning' as const,
      label: 'Morning',
      description: '6:00 AM - 12:00 PM',
      icon: Sun,
      checked: value.morning,
    },
    {
      key: 'afternoon' as const,
      label: 'Afternoon',
      description: '12:00 PM - 6:00 PM',
      icon: Sun,
      checked: value.afternoon,
    },
    {
      key: 'evening' as const,
      label: 'Evening',
      description: '6:00 PM - 10:00 PM',
      icon: Sunset,
      checked: value.evening,
    },
    {
      key: 'weekends' as const,
      label: 'Weekends',
      description: 'Saturday & Sunday',
      icon: Calendar,
      checked: value.weekends,
    },
  ];

  const selectedCount = Object.values(value).filter(Boolean).length;

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Availability Preferences
      </Label>

      <div className="space-y-3">
        {availabilityOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.key} className="flex items-center space-x-3">
              <Checkbox
                id={option.key}
                checked={option.checked}
                onCheckedChange={(checked) => 
                  handleChange(option.key, checked === true)
                }
              />
              <div className="flex items-center space-x-2 flex-1">
                <Icon className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <Label 
                    htmlFor={option.key} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-md">
          <Clock className="h-3 w-3 inline mr-1" />
          {selectedCount} time preference{selectedCount !== 1 ? 's' : ''} selected
        </div>
      )}

      {selectedCount === 0 && (
        <div className="text-xs text-gray-400">
          No specific time preferences
        </div>
      )}
    </div>
  );
}