"use client";

import React, { useState } from "react";
import { DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DEFAULT_FILTERS, PRICE_RANGE } from "@/types/filters";

interface PriceRangeVisualProps {
  value: {
    min: number;
    max: number;
  };
  onChange: (value: { min: number; max: number }) => void;
}

export default function PriceRangeVisual({
  value,
  onChange,
}: PriceRangeVisualProps) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const isDefault = 
    value.min === DEFAULT_FILTERS.priceRange.min && 
    value.max === DEFAULT_FILTERS.priceRange.max;

  const handleSliderChange = (newValue: number[]) => {
    const [min, max] = newValue;
    setTempValue({ min, max });
  };

  const handleApply = () => {
    onChange(tempValue);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultRange = { ...DEFAULT_FILTERS.priceRange };
    setTempValue(defaultRange);
    onChange(defaultRange);
    setOpen(false);
  };

  // Update temp value when external value changes
  React.useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (isDefault) {
    // Empty state - show picker button
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <DollarSign className="h-4 w-4" />
            Price Range
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Price Range: ${tempValue.min} - ${tempValue.max}
              </Label>
              <div className="px-2">
                <Slider
                  value={[tempValue.min, tempValue.max]}
                  onValueChange={handleSliderChange}
                  min={PRICE_RANGE.min}
                  max={PRICE_RANGE.max}
                  step={PRICE_RANGE.step}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>${PRICE_RANGE.min}</span>
                <span>${PRICE_RANGE.max}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // With selection - show tag + ability to change
  return (
    <div className="flex items-center gap-2">
      {/* Selected price range tag */}
      <Badge
        variant="default"
        className="gap-1 px-2 py-1 text-xs cursor-pointer hover:bg-primary/80"
        onClick={() => setOpen(true)}
      >
        <DollarSign className="h-3 w-3" />
        ${value.min}-${value.max}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          aria-label="Remove price range filter"
        >
          ×
        </button>
      </Badge>
      
      {/* Change price range popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Price Range: ${tempValue.min} - ${tempValue.max}
              </Label>
              <div className="px-2">
                <Slider
                  value={[tempValue.min, tempValue.max]}
                  onValueChange={handleSliderChange}
                  min={PRICE_RANGE.min}
                  max={PRICE_RANGE.max}
                  step={PRICE_RANGE.step}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>${PRICE_RANGE.min}</span>
                <span>${PRICE_RANGE.max}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}