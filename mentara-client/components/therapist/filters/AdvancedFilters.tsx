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
  CollapsibleTrigger,
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

export default function AdvancedFilters({
  filters,
  onChange,
  onApply,
  onReset,
  isExpanded = false,
  onExpandedChange,
  className = "",
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TherapistFilters>(filters);

  const updateFilter = <K extends keyof TherapistFilters>(
    key: K,
    value: TherapistFilters[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
    onReset?.();
  };

  const handleApply = () => {
    onApply?.();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    
    if (localFilters.specialties.length > 0) count++;
    if (localFilters.priceRange.min !== DEFAULT_FILTERS.priceRange.min || 
        localFilters.priceRange.max !== DEFAULT_FILTERS.priceRange.max) count++;
    if (localFilters.location) count++;
    if (Object.values(localFilters.availability).some(Boolean)) count++;
    if (localFilters.insurance.length > 0) count++;
    if (localFilters.languages.length > 0) count++;
    if (localFilters.experienceLevel.min !== DEFAULT_FILTERS.experienceLevel.min || 
        localFilters.experienceLevel.max !== DEFAULT_FILTERS.experienceLevel.max) count++;
    if (localFilters.rating > 0) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const renderFilterSummary = () => {
    const summaryItems = [];
    
    if (localFilters.specialties.length > 0) {
      summaryItems.push(`${localFilters.specialties.length} specialties`);
    }
    if (localFilters.location) {
      const locationLabel = LOCATION_OPTIONS.find(loc => loc.value === localFilters.location)?.label || localFilters.location;
      summaryItems.push(locationLabel);
    }
    if (localFilters.priceRange.min !== DEFAULT_FILTERS.priceRange.min || 
        localFilters.priceRange.max !== DEFAULT_FILTERS.priceRange.max) {
      summaryItems.push(`$${localFilters.priceRange.min}-${localFilters.priceRange.max}`);
    }
    if (Object.values(localFilters.availability).some(Boolean)) {
      const availCount = Object.values(localFilters.availability).filter(Boolean).length;
      summaryItems.push(`${availCount} time slots`);
    }
    if (localFilters.rating > 0) {
      summaryItems.push(`${localFilters.rating}+ stars`);
    }

    return summaryItems;
  };

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
              onClick={() => onExpandedChange?.(!isExpanded)}
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
                  onValueChange={(value) => updateFilter('sortBy', value as any)}
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
                  onValueChange={(value) => updateFilter('sortOrder', value as any)}
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