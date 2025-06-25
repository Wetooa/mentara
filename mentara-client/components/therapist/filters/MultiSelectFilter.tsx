"use client";

import React, { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { FilterOption } from "@/types/filters";

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  maxDisplayed?: number;
  className?: string;
}

export default function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  maxDisplayed = 3,
  className = "",
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newValues);
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selectedValues.filter((v) => v !== value));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedLabels = () => {
    return selectedValues.map(value => 
      options.find(option => option.value === value)?.label || value
    );
  };

  const displayedLabels = getSelectedLabels().slice(0, maxDisplayed);
  const remainingCount = selectedValues.length - maxDisplayed;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between min-h-[40px] h-auto"
          >
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {selectedValues.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                <>
                  {displayedLabels.map((label, index) => {
                    const value = selectedValues[index];
                    return (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(value);
                        }}
                      >
                        {label}
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                      </Badge>
                    );
                  })}
                  {remainingCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{remainingCount} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {selectedValues.length > 0 && (
                <CommandItem
                  onSelect={handleClearAll}
                  className="text-red-600 font-medium"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedValues.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-sm text-gray-500">({option.count})</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected items summary */}
      {selectedValues.length > 0 && (
        <div className="text-xs text-gray-500">
          {selectedValues.length} selected
        </div>
      )}
    </div>
  );
}