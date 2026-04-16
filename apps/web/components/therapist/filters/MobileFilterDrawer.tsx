'use client';

import React, { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Filter,
  MapPin,
  DollarSign,
  Star,
  Heart,
  Brain,
  Calendar,
  Languages,
  Settings,
  RotateCcw
} from 'lucide-react';

interface FilterState {
  specialties: string[];
  approaches: string[];
  experience: [number, number];
  rating: number;
  priceRange: [number, number];
  location: {
    distance: number;
    inPerson: boolean;
    virtual: boolean;
  };
  availability: {
    weekdays: boolean;
    evenings: boolean;
    weekends: boolean;
    urgent: boolean;
  };
  languages: string[];
  insurance: string[];
  gender: string[];
  sortBy: string;
}

interface MobileFilterDrawerProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  activeFilterCount: number;
  children?: React.ReactNode;
  className?: string;
}

const filterSections = [
  {
    id: 'specialties',
    title: 'Specialties',
    icon: Heart,
    options: [
      'Anxiety & Stress',
      'Depression',
      'Trauma & PTSD',
      'Relationship Issues',
      'Addiction Recovery',
      'Grief & Loss',
      'Eating Disorders',
      'ADHD',
      'Bipolar Disorder',
      'OCD',
      'Family Therapy',
      'Couples Therapy'
    ]
  },
  {
    id: 'approaches',
    title: 'Treatment Approaches',
    icon: Brain,
    options: [
      'Cognitive Behavioral Therapy (CBT)',
      'Dialectical Behavior Therapy (DBT)',
      'EMDR',
      'Psychodynamic Therapy',
      'Mindfulness-Based Therapy',
      'Solution-Focused Therapy',
      'Acceptance and Commitment Therapy',
      'Humanistic Therapy'
    ]
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: Languages,
    options: [
      'English',
      'Spanish',
      'French',
      'German',
      'Chinese',
      'Japanese',
      'Korean',
      'Arabic',
      'Portuguese',
      'Italian'
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance Accepted',
    icon: Settings,
    options: [
      'Aetna',
      'Blue Cross Blue Shield',
      'Cigna',
      'UnitedHealth',
      'Kaiser Permanente',
      'Humana',
      'Medicare',
      'Medicaid',
      'No Insurance Required'
    ]
  },
  {
    id: 'gender',
    title: 'Therapist Gender',
    icon: Settings,
    options: [
      'Male',
      'Female',
      'Non-binary',
      'No preference'
    ]
  }
];

export function MobileFilterDrawer({
  filters,
  onFiltersChange,
  onReset,
  activeFilterCount,
  children,
  className
}: MobileFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const updateLocalFilters = (updates: Partial<FilterState>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    onReset();
    setLocalFilters(filters);
  };

  const handleArrayToggle = (key: keyof FilterState, value: string) => {
    const currentArray = localFilters[key] as string[];
    const updated = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateLocalFilters({ [key]: updated });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild className={className}>
        {children || (
          <Button variant="outline" className="gap-2 relative">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Therapists
              </DrawerTitle>
              <DrawerDescription>
                Find therapists that match your specific needs and preferences
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 py-4">
            {/* Experience Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Experience Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Years of Experience: {localFilters.experience[0]} - {localFilters.experience[1]} years
                  </Label>
                  <Slider
                    value={localFilters.experience}
                    onValueChange={(value) => updateLocalFilters({ experience: value as [number, number] })}
                    min={0}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Minimum Rating: {localFilters.rating}+ stars
                  </Label>
                  <Slider
                    value={[localFilters.rating]}
                    onValueChange={(value) => updateLocalFilters({ rating: value[0] })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Price Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="text-sm text-muted-foreground">
                  ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]} per session
                </Label>
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => updateLocalFilters({ priceRange: value as [number, number] })}
                  min={50}
                  max={300}
                  step={10}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Location & Format */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location & Format
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Distance: Within {localFilters.location.distance} miles
                  </Label>
                  <Slider
                    value={[localFilters.location.distance]}
                    onValueChange={(value) => updateLocalFilters({ 
                      location: { ...localFilters.location, distance: value[0] }
                    })}
                    min={5}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">In-Person Sessions</Label>
                    <Switch
                      checked={localFilters.location.inPerson}
                      onCheckedChange={(checked) => updateLocalFilters({
                        location: { ...localFilters.location, inPerson: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Virtual Sessions</Label>
                    <Switch
                      checked={localFilters.location.virtual}
                      onCheckedChange={(checked) => updateLocalFilters({
                        location: { ...localFilters.location, virtual: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Weekday Appointments</Label>
                  <Switch
                    checked={localFilters.availability.weekdays}
                    onCheckedChange={(checked) => updateLocalFilters({
                      availability: { ...localFilters.availability, weekdays: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Evening Hours</Label>
                  <Switch
                    checked={localFilters.availability.evenings}
                    onCheckedChange={(checked) => updateLocalFilters({
                      availability: { ...localFilters.availability, evenings: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Weekend Availability</Label>
                  <Switch
                    checked={localFilters.availability.weekends}
                    onCheckedChange={(checked) => updateLocalFilters({
                      availability: { ...localFilters.availability, weekends: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Urgent/Same-Day</Label>
                  <Switch
                    checked={localFilters.availability.urgent}
                    onCheckedChange={(checked) => updateLocalFilters({
                      availability: { ...localFilters.availability, urgent: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checkbox Sections */}
            {filterSections.map((section) => {
              const Icon = section.icon;
              const selectedItems = localFilters[section.id as keyof FilterState] as string[];
              
              return (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {section.title}
                      {selectedItems.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedItems.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {section.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${section.id}-${option}`}
                            checked={selectedItems.includes(option)}
                            onCheckedChange={() => handleArrayToggle(section.id as keyof FilterState, option)}
                          />
                          <Label
                            htmlFor={`${section.id}-${option}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-border">
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
          
          {/* Filter Summary */}
          <div className="text-xs text-center text-muted-foreground">
            {Object.values(localFilters).flat().filter(Boolean).length} filters active
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileFilterDrawer;