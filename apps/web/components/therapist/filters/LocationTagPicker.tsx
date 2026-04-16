"use client";

import React, { useState } from "react";
import { Check, ChevronDown, MapPin, Plus } from "lucide-react";
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
import { LOCATION_OPTIONS } from "@/types/filters";

interface LocationTagPickerProps {
  selectedLocation: string;
  onChange: (location: string) => void;
}

export default function LocationTagPicker({
  selectedLocation,
  onChange,
}: LocationTagPickerProps) {
  const [open, setOpen] = useState(false);

  const handleLocationSelect = (locationValue: string) => {
    // Toggle off if clicking the same location, otherwise set new location
    if (selectedLocation === locationValue) {
      onChange('');
    } else {
      onChange(locationValue);
    }
    setOpen(false);
  };

  const getLocationLabel = (value: string) => {
    return LOCATION_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  if (!selectedLocation) {
    // Empty state - show picker button
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <MapPin className="h-4 w-4" />
            Location
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search provinces..." />
            <CommandList>
              <CommandEmpty>No provinces found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => handleLocationSelect('')}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      !selectedLocation ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  All Provinces
                </CommandItem>
                {LOCATION_OPTIONS.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={() => handleLocationSelect(location.value)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedLocation === location.value
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {location.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // With selection - show tag + ability to change
  return (
    <div className="flex items-center gap-2">
      {/* Selected location tag */}
      <Badge
        variant="default"
        className="gap-1 px-2 py-1 text-xs cursor-pointer hover:bg-primary/80"
        onClick={() => setOpen(true)}
      >
        <MapPin className="h-3 w-3" />
        {getLocationLabel(selectedLocation)}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${getLocationLabel(selectedLocation)} location filter`}
        >
          ×
        </button>
      </Badge>
      
      {/* Change location button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search provinces..." />
            <CommandList>
              <CommandEmpty>No provinces found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => handleLocationSelect('')}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      !selectedLocation ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  All Provinces
                </CommandItem>
                {LOCATION_OPTIONS.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={() => handleLocationSelect(location.value)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedLocation === location.value
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {location.label}
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