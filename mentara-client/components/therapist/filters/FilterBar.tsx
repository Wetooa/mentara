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
    const newFilters = { ...filters };
    
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
    <Card className={`${className} shadow-sm border-blue-100 bg-gradient-to-r from-blue-50/30 to-white`}>
      <CardContent className="p-5 space-y-5">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Find Your Therapist</h3>
          </div>
          {activeFiltersData.length > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-blue-100 text-blue-700 font-medium"
            >
              {activeFiltersData.length} filter{activeFiltersData.length !== 1 ? 's' : ''} applied
            </Badge>
          )}
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Specialty Tag Picker */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Specialty</label>
            <SpecialtyTagPicker
              selectedSpecialties={filters.specialties}
              onChange={(specialties) => updateFilters('specialties', specialties)}
            />
          </div>
          
          {/* Location Tag Picker */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Location</label>
            <LocationTagPicker
              selectedLocation={filters.location}
              onChange={(location) => updateFilters('location', location)}
            />
          </div>
          
          {/* Price Range Visual */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Session Rate</label>
            <PriceRangeVisual
              value={filters.priceRange}
              onChange={(priceRange) => updateFilters('priceRange', priceRange)}
            />
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="flex flex-col justify-end">
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors mt-auto"
                  aria-expanded={isAdvancedOpen}
                  aria-controls="advanced-filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  More Options
                  {isAdvancedOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent 
                className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                id="advanced-filters"
              >
                <AdvancedFilterGroup
                  filters={filters}
                  onChange={onChange}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {activeFiltersData.length > 0 && (
          <div className="flex flex-wrap gap-2 items-start pt-3 border-t border-blue-100">
            <div className="flex items-center gap-2 mb-2 w-full">
              <span className="text-sm text-gray-700 font-semibold">Applied Filters:</span>
              {activeFiltersData.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-auto px-2 py-1 text-xs font-medium ml-auto"
                >
                  Clear all filters
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              {activeFiltersData.map((filter, index) => (
                <Badge
                  key={`${filter.type}-${index}`}
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 text-xs bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-50"
                >
                  <span className="font-medium">{filter.label}</span>
                  <button
                    onClick={() => handleFilterRemove(filter.type, filter.value)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}