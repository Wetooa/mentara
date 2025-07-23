"use client";

import React, { useState, useMemo } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  TherapistFilters, 
  DEFAULT_FILTERS,
  SPECIALTY_OPTIONS,
  LOCATION_OPTIONS,
} from "@/types/filters";

// Import sub-components for tag-based filtering
import SpecialtyTagPicker from "./SpecialtyTagPicker";
import LocationTagPicker from "./LocationTagPicker";
import PriceRangeVisual from "./PriceRangeVisual";
import AdvancedFilterGroup from "./AdvancedFilterGroup";

interface FilterBarProps {
  filters: TherapistFilters;
  onChange: (filters: TherapistFilters) => void;
  className?: string;
  onFiltersChange?: (hasActiveFilters: boolean) => void;
}

export default function FilterBar({
  filters,
  onChange,
  className = "",
  onFiltersChange,
}: FilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Calculate active filters count
  const activeFiltersData = useMemo(() => {
    const activeFilters: Array<{ type: string; label: string; value: any }> = [];
    
    // Specialties
    if (filters.specialties.length > 0) {
      filters.specialties.forEach(specialty => {
        const option = SPECIALTY_OPTIONS.find(opt => opt.value === specialty);
        activeFilters.push({
          type: 'specialty',
          label: option?.label || specialty,
          value: specialty
        });
      });
    }
    
    // Location
    if (filters.location) {
      const option = LOCATION_OPTIONS.find(opt => opt.value === filters.location);
      activeFilters.push({
        type: 'location',
        label: option?.label || filters.location,
        value: filters.location
      });
    }
    
    // Price Range
    if (filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min || 
        filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max) {
      activeFilters.push({
        type: 'priceRange',
        label: `$${filters.priceRange.min}-$${filters.priceRange.max}`,
        value: filters.priceRange
      });
    }
    
    // Experience Level
    if (filters.experienceLevel.min !== DEFAULT_FILTERS.experienceLevel.min || 
        filters.experienceLevel.max !== DEFAULT_FILTERS.experienceLevel.max) {
      activeFilters.push({
        type: 'experienceLevel',
        label: `${filters.experienceLevel.min}-${filters.experienceLevel.max} years`,
        value: filters.experienceLevel
      });
    }
    
    // Rating
    if (filters.rating > 0) {
      activeFilters.push({
        type: 'rating',
        label: `${filters.rating}+ stars`,
        value: filters.rating
      });
    }
    
    // Availability
    const availabilityCount = Object.values(filters.availability).filter(Boolean).length;
    if (availabilityCount > 0) {
      const times = Object.entries(filters.availability)
        .filter(([_, value]) => value)
        .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1));
      activeFilters.push({
        type: 'availability',
        label: times.length === 1 ? times[0] : `${times.length} time slots`,
        value: filters.availability
      });
    }
    
    // Insurance
    if (filters.insurance.length > 0) {
      activeFilters.push({
        type: 'insurance',
        label: filters.insurance.length === 1 
          ? filters.insurance[0] 
          : `${filters.insurance.length} insurance plans`,
        value: filters.insurance
      });
    }
    
    // Languages
    if (filters.languages.length > 0) {
      activeFilters.push({
        type: 'languages',
        label: filters.languages.length === 1 
          ? filters.languages[0] 
          : `${filters.languages.length} languages`,
        value: filters.languages
      });
    }
    
    return activeFilters;
  }, [filters]);

  // Notify parent of active filters state
  React.useEffect(() => {
    onFiltersChange?.(activeFiltersData.length > 0);
  }, [activeFiltersData.length, onFiltersChange]);

  const handleFilterRemove = (filterType: string, value?: any) => {
    let newFilters = { ...filters };
    
    switch (filterType) {
      case 'specialty':
        newFilters.specialties = filters.specialties.filter(s => s !== value);
        break;
      case 'location':
        newFilters.location = '';
        break;
      case 'priceRange':
        newFilters.priceRange = { ...DEFAULT_FILTERS.priceRange };
        break;
      case 'experienceLevel':
        newFilters.experienceLevel = { ...DEFAULT_FILTERS.experienceLevel };
        break;
      case 'rating':
        newFilters.rating = 0;
        break;
      case 'availability':
        newFilters.availability = { ...DEFAULT_FILTERS.availability };
        break;
      case 'insurance':
        newFilters.insurance = [];
        break;
      case 'languages':
        newFilters.languages = [];
        break;
    }
    
    onChange(newFilters);
  };

  const handleClearAll = () => {
    onChange(DEFAULT_FILTERS);
  };

  const updateFilters = <K extends keyof TherapistFilters>(
    key: K,
    value: TherapistFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Specialty Tag Picker */}
          <SpecialtyTagPicker
            selectedSpecialties={filters.specialties}
            onChange={(specialties) => updateFilters('specialties', specialties)}
          />
          
          {/* Location Tag Picker */}
          <LocationTagPicker
            selectedLocation={filters.location}
            onChange={(location) => updateFilters('location', location)}
          />
          
          {/* Price Range Visual */}
          <PriceRangeVisual
            value={filters.priceRange}
            onChange={(priceRange) => updateFilters('priceRange', priceRange)}
          />
          
          {/* Advanced Filters Toggle */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                More Filters
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3">
              <AdvancedFilterGroup
                filters={filters}
                onChange={onChange}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Active Filters Display */}
        {activeFiltersData.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            
            {activeFiltersData.map((filter, index) => (
              <Badge
                key={`${filter.type}-${index}`}
                variant="secondary"
                className="gap-1 px-2 py-1 text-xs"
              >
                {filter.label}
                <button
                  onClick={() => handleFilterRemove(filter.type, filter.value)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {activeFiltersData.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-gray-600 hover:text-gray-800 h-auto p-1 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}