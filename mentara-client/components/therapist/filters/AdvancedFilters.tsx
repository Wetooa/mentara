"use client";

import React, { useState } from "react";
import { Filter, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import MultiSelectFilter from "./MultiSelectFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import AvailabilityFilter from "./AvailabilityFilter";
import { 
  TherapistFilters, 
  DEFAULT_FILTERS,
  SPECIALTY_OPTIONS,
  INSURANCE_OPTIONS,
  LANGUAGE_OPTIONS,
  LOCATION_OPTIONS,
  SORT_OPTIONS,
  PRICE_RANGE,
  EXPERIENCE_RANGE,
} from "@/types/filters";

interface AdvancedFiltersProps {
  filters: TherapistFilters;
  onChange: (filters: TherapistFilters) => void;
  onApply?: () => void;
  onReset?: () => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

// Input validation helper
function validateFilters(filters: TherapistFilters): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!filters || typeof filters !== 'object') {
    errors.push('Filters must be a valid object');
    return { isValid: false, errors };
  }
  
  // Validate specialties array
  if (filters.specialties && !Array.isArray(filters.specialties)) {
    errors.push('Specialties must be an array');
  }
  
  // Validate price range
  if (filters.priceRange) {
    if (typeof filters.priceRange.min !== 'number' || typeof filters.priceRange.max !== 'number') {
      errors.push('Price range min and max must be numbers');
    }
    if (filters.priceRange.min < 0 || filters.priceRange.max < 0) {
      errors.push('Price range values must be non-negative');
    }
    if (filters.priceRange.min > filters.priceRange.max) {
      errors.push('Price range min cannot be greater than max');
    }
  }
  
  // Validate experience level
  if (filters.experienceLevel) {
    if (typeof filters.experienceLevel.min !== 'number' || typeof filters.experienceLevel.max !== 'number') {
      errors.push('Experience level min and max must be numbers');
    }
    if (filters.experienceLevel.min < 0 || filters.experienceLevel.max < 0) {
      errors.push('Experience level values must be non-negative');
    }
  }
  
  // Validate rating
  if (filters.rating && (typeof filters.rating !== 'number' || filters.rating < 0 || filters.rating > 5)) {
    errors.push('Rating must be a number between 0 and 5');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Safe filter access helper
function safeGetFilterValue<T>(obj: unknown, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current?.[key] === undefined) return defaultValue;
      current = current[key];
    }
    return current ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export function AdvancedFilters({
  filters,
  onChange,
  onApply,
  onReset,
  isExpanded = false,
  onExpandedChange,
  className = "",
}: AdvancedFiltersProps) {
  // All hooks must be called before any conditional returns
  const [localFilters, setLocalFilters] = useState<TherapistFilters>(() => {
    try {
      return filters;
    } catch (error) {
      console.error('Error initializing filters:', error);
      return DEFAULT_FILTERS;
    }
  });
  const [hasError, setHasError] = useState<string | null>(null);

  // Input validation (after hooks)
  const validation = validateFilters(filters);
  if (!validation.isValid) {
    console.error('AdvancedFilters: Invalid filter props:', validation.errors);
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Filter Configuration Error</div>
          <div className="text-sm text-gray-600">
            There was an issue with the filter settings. Please refresh the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateFilter = <K extends keyof TherapistFilters>(
    key: K,
    value: TherapistFilters[K]
  ) => {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid filter key:', key);
        return;
      }
      
      const newFilters = { ...localFilters, [key]: value };
      
      // Validate the new filter state
      const validation = validateFilters(newFilters);
      if (!validation.isValid) {
        console.warn('Filter update would create invalid state:', validation.errors);
        // Don't update if it would create invalid state
        return;
      }
      
      setLocalFilters(newFilters);
      onChange(newFilters);
      setHasError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error updating filter:', error, { key, value });
      setHasError(`Failed to update ${String(key)} filter`);
    }
  };

  const handleReset = () => {
    try {
      setLocalFilters(DEFAULT_FILTERS);
      onChange(DEFAULT_FILTERS);
      onReset?.();
      setHasError(null);
    } catch (error) {
      console.error('Error resetting filters:', error);
      setHasError('Failed to reset filters');
    }
  };

  const handleApply = () => {
    try {
      onApply?.();
    } catch (error) {
      console.error('Error applying filters:', error);
      setHasError('Failed to apply filters');
    }
  };

  const getActiveFilterCount = () => {
    try {
      let count = 0;
      
      // Safe access to filter properties with fallbacks
      const specialties = safeGetFilterValue(localFilters, 'specialties', []);
      if (Array.isArray(specialties) && specialties.length > 0) count++;
      
      const priceMin = safeGetFilterValue(localFilters, 'priceRange.min', DEFAULT_FILTERS.priceRange.min);
      const priceMax = safeGetFilterValue(localFilters, 'priceRange.max', DEFAULT_FILTERS.priceRange.max);
      if (priceMin !== DEFAULT_FILTERS.priceRange.min || priceMax !== DEFAULT_FILTERS.priceRange.max) count++;
      
      const location = safeGetFilterValue(localFilters, 'location', '');
      if (location) count++;
      
      const availability = safeGetFilterValue(localFilters, 'availability', {});
      if (typeof availability === 'object' && Object.values(availability).some(Boolean)) count++;
      
      const insurance = safeGetFilterValue(localFilters, 'insurance', []);
      if (Array.isArray(insurance) && insurance.length > 0) count++;
      
      const languages = safeGetFilterValue(localFilters, 'languages', []);
      if (Array.isArray(languages) && languages.length > 0) count++;
      
      const expMin = safeGetFilterValue(localFilters, 'experienceLevel.min', DEFAULT_FILTERS.experienceLevel.min);
      const expMax = safeGetFilterValue(localFilters, 'experienceLevel.max', DEFAULT_FILTERS.experienceLevel.max);
      if (expMin !== DEFAULT_FILTERS.experienceLevel.min || expMax !== DEFAULT_FILTERS.experienceLevel.max) count++;
      
      const rating = safeGetFilterValue(localFilters, 'rating', 0);
      if (rating > 0) count++;
      
      return count;
    } catch (error) {
      console.error('Error calculating active filter count:', error);
      return 0;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  const renderFilterSummary = () => {
    try {
      const summaryItems = [];
      
      const specialties = safeGetFilterValue(localFilters, 'specialties', []);
      if (Array.isArray(specialties) && specialties.length > 0) {
        summaryItems.push(`${specialties.length} specialties`);
      }
      
      const location = safeGetFilterValue(localFilters, 'location', '');
      if (location) {
        try {
          const locationLabel = LOCATION_OPTIONS.find(loc => loc?.value === location)?.label || location;
          summaryItems.push(locationLabel);
        } catch {
          summaryItems.push(location);
        }
      }
      
      const priceMin = safeGetFilterValue(localFilters, 'priceRange.min', DEFAULT_FILTERS.priceRange.min);
      const priceMax = safeGetFilterValue(localFilters, 'priceRange.max', DEFAULT_FILTERS.priceRange.max);
      if (priceMin !== DEFAULT_FILTERS.priceRange.min || priceMax !== DEFAULT_FILTERS.priceRange.max) {
        summaryItems.push(`$${priceMin}-${priceMax}`);
      }
      
      const availability = safeGetFilterValue(localFilters, 'availability', {});
      if (typeof availability === 'object' && Object.values(availability).some(Boolean)) {
        const availCount = Object.values(availability).filter(Boolean).length;
        summaryItems.push(`${availCount} time slots`);
      }
      
      const rating = safeGetFilterValue(localFilters, 'rating', 0);
      if (rating > 0) {
        summaryItems.push(`${rating}+ stars`);
      }

      return summaryItems;
    } catch (error) {
      console.error('Error rendering filter summary:', error);
      return ['Error loading filters'];
    }
  };

  // Component error state
  if (hasError) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Filter Error</div>
          <div className="text-sm text-gray-600 mb-4">
            {hasError}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setHasError(null);
              handleReset();
            }}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                try {
                  onExpandedChange?.(!isExpanded);
                } catch (error) {
                  console.error('Error toggling expanded state:', error);
                }
              }}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        {activeFilterCount > 0 && !isExpanded && (
          <div className="flex flex-wrap gap-1 mt-2">
            {renderFilterSummary().map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={onExpandedChange}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Sort Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Sort By</Label>
              <div className="flex gap-2">
                <Select
                  value={localFilters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value as TherapistFilters['sortBy'])}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={localFilters.sortOrder}
                  onValueChange={(value) => updateFilter('sortOrder', value as TherapistFilters['sortOrder'])}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">High to Low</SelectItem>
                    <SelectItem value="asc">Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Specialties */}
            <MultiSelectFilter
              label="Specialties"
              options={SPECIALTY_OPTIONS}
              selectedValues={localFilters.specialties}
              onSelectionChange={(values) => updateFilter('specialties', values)}
              placeholder="Select specialties..."
            />

            {/* Price Range */}
            <PriceRangeFilter
              value={localFilters.priceRange}
              onChange={(value) => updateFilter('priceRange', value)}
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={PRICE_RANGE.step}
            />

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Location/Province</Label>
              <Select
                value={localFilters.location}
                onValueChange={(value) => updateFilter('location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Provinces</SelectItem>
                  {LOCATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <AvailabilityFilter
              value={localFilters.availability}
              onChange={(value) => updateFilter('availability', value)}
            />

            {/* Experience Level */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
              <div className="px-2">
                <Slider
                  value={[localFilters.experienceLevel.min, localFilters.experienceLevel.max]}
                  onValueChange={([min, max]) => updateFilter('experienceLevel', { min, max })}
                  min={EXPERIENCE_RANGE.min}
                  max={EXPERIENCE_RANGE.max}
                  step={EXPERIENCE_RANGE.step}
                  className="w-full"
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {localFilters.experienceLevel.min} - {localFilters.experienceLevel.max} years
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Minimum Rating</Label>
              <div className="px-2">
                <Slider
                  value={[localFilters.rating]}
                  onValueChange={([rating]) => updateFilter('rating', rating)}
                  min={0}
                  max={5}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {localFilters.rating > 0 ? `${localFilters.rating}+ stars` : 'Any rating'}
              </div>
            </div>

            {/* Insurance */}
            <MultiSelectFilter
              label="Insurance Accepted"
              options={INSURANCE_OPTIONS}
              selectedValues={localFilters.insurance}
              onSelectionChange={(values) => updateFilter('insurance', values)}
              placeholder="Select insurance plans..."
            />

            {/* Languages */}
            <MultiSelectFilter
              label="Languages Spoken"
              options={LANGUAGE_OPTIONS}
              selectedValues={localFilters.languages}
              onSelectionChange={(values) => updateFilter('languages', values)}
              placeholder="Select languages..."
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
                disabled={activeFilterCount === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}