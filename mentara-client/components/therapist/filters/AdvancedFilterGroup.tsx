"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TherapistFilters, 
  DEFAULT_FILTERS,
  INSURANCE_OPTIONS,
  LANGUAGE_OPTIONS,
  EXPERIENCE_RANGE,
} from "@/types/filters";
import AvailabilityFilter from "./AvailabilityFilter";

interface AdvancedFilterGroupProps {
  filters: TherapistFilters;
  onChange: (filters: TherapistFilters) => void;
}

export default function AdvancedFilterGroup({
  filters,
  onChange,
}: AdvancedFilterGroupProps) {
  
  const updateFilter = <K extends keyof TherapistFilters>(
    key: K,
    value: TherapistFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-6">
        {/* Insurance */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Insurance Accepted</Label>
          <div className="flex flex-wrap gap-2">
            {INSURANCE_OPTIONS.map((insurance) => (
              <Badge
                key={insurance.value}
                variant={filters.insurance.includes(insurance.value) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => 
                  updateFilter('insurance', toggleArrayItem(filters.insurance, insurance.value))
                }
              >
                {insurance.label}
              </Badge>
            ))}
          </div>
          {filters.insurance.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('insurance', [])}
              className="text-xs h-6"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Languages Spoken</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((language) => (
              <Badge
                key={language.value}
                variant={filters.languages.includes(language.value) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => 
                  updateFilter('languages', toggleArrayItem(filters.languages, language.value))
                }
              >
                {language.label}
              </Badge>
            ))}
          </div>
          {filters.languages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('languages', [])}
              className="text-xs h-6"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Availability</Label>
          <AvailabilityFilter
            value={filters.availability}
            onChange={(value) => updateFilter('availability', value)}
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Years of Experience: {filters.experienceLevel.min} - {filters.experienceLevel.max} years
          </Label>
          <div className="px-2">
            <Slider
              value={[filters.experienceLevel.min, filters.experienceLevel.max]}
              onValueChange={([min, max]) => updateFilter('experienceLevel', { min, max })}
              min={EXPERIENCE_RANGE.min}
              max={EXPERIENCE_RANGE.max}
              step={EXPERIENCE_RANGE.step}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{EXPERIENCE_RANGE.min} years</span>
            <span>{EXPERIENCE_RANGE.max}+ years</span>
          </div>
          {(filters.experienceLevel.min !== DEFAULT_FILTERS.experienceLevel.min || 
            filters.experienceLevel.max !== DEFAULT_FILTERS.experienceLevel.max) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('experienceLevel', { ...DEFAULT_FILTERS.experienceLevel })}
              className="text-xs h-6"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Minimum Rating: {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
          </Label>
          <div className="px-2">
            <Slider
              value={[filters.rating]}
              onValueChange={([rating]) => updateFilter('rating', rating)}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Any rating</span>
            <span>5 stars</span>
          </div>
          {filters.rating > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('rating', 0)}
              className="text-xs h-6"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Sort Options */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <Label className="text-sm font-medium text-gray-700">Sort Results</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'rating', label: 'By Rating' },
              { value: 'price', label: 'By Price' },
              { value: 'experience', label: 'By Experience' },
              { value: 'availability', label: 'By Availability' },
              { value: 'name', label: 'By Name' },
            ].map((sort) => (
              <Badge
                key={sort.value}
                variant={filters.sortBy === sort.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => updateFilter('sortBy', sort.value as TherapistFilters['sortBy'])}
              >
                {sort.label}
                {filters.sortBy === sort.value && (
                  <span className="ml-1">
                    {filters.sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </Badge>
            ))}
          </div>
          
          {/* Sort Order Toggle */}
          {filters.sortBy !== 'name' && (
            <div className="flex gap-2">
              <Button
                variant={filters.sortOrder === 'desc' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('sortOrder', 'desc')}
                className="text-xs"
              >
                High to Low
              </Button>
              <Button
                variant={filters.sortOrder === 'asc' ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('sortOrder', 'asc')}
                className="text-xs"
              >
                Low to High
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}