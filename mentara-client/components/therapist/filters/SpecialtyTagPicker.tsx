"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SPECIALTY_OPTIONS } from "@/types/filters";

interface SpecialtyTagPickerProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
  maxVisible?: number;
}

export default function SpecialtyTagPicker({
  selectedSpecialties,
  onChange,
  maxVisible = 3,
}: SpecialtyTagPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSpecialtyToggle = (specialtyValue: string) => {
    const isSelected = selectedSpecialties.includes(specialtyValue);
    
    if (isSelected) {
      onChange(selectedSpecialties.filter(s => s !== specialtyValue));
    } else {
      onChange([...selectedSpecialties, specialtyValue]);
    }
  };

  const getSpecialtyLabel = (value: string) => {
    return SPECIALTY_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const visibleSpecialties = selectedSpecialties.slice(0, maxVisible);
  const hiddenCount = Math.max(0, selectedSpecialties.length - maxVisible);

  if (selectedSpecialties.length === 0) {
    // Empty state - show picker button
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Plus className="h-4 w-4" />
            Specialties
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search specialties..." />
            <CommandList>
              <CommandEmpty>No specialties found.</CommandEmpty>
              <CommandGroup>
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <CommandItem
                    key={specialty.value}
                    value={specialty.value}
                    onSelect={() => handleSpecialtyToggle(specialty.value)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedSpecialties.includes(specialty.value)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {specialty.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // With selections - show tags + picker
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Visible specialty tags */}
      {visibleSpecialties.map((specialty) => (
        <Badge
          key={specialty}
          variant="default"
          className="gap-1 px-2 py-1 text-xs cursor-pointer hover:bg-primary/80"
          onClick={() => handleSpecialtyToggle(specialty)}
        >
          {getSpecialtyLabel(specialty)}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSpecialtyToggle(specialty);
            }}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${getSpecialtyLabel(specialty)} specialty`}
          >
            ×
          </button>
        </Badge>
      ))}
      
      {/* Hidden count badge */}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{hiddenCount} more
        </Badge>
      )}
      
      {/* Add more button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search specialties..." />
            <CommandList>
              <CommandEmpty>No specialties found.</CommandEmpty>
              <CommandGroup>
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <CommandItem
                    key={specialty.value}
                    value={specialty.value}
                    onSelect={() => {
                      handleSpecialtyToggle(specialty.value);
                      // Don't close popover so users can select multiple
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedSpecialties.includes(specialty.value)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {specialty.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}