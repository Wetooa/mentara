"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface PriceRangeFilterProps {
  value: {
    min: number;
    max: number;
  };
  onChange: (value: { min: number; max: number }) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function PriceRangeFilter({
  value,
  onChange,
  min = 50,
  max = 500,
  step = 10,
  className = "",
}: PriceRangeFilterProps) {
  const handleSliderChange = (values: number[]) => {
    onChange({
      min: values[0],
      max: values[1],
    });
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value, 10) || min;
    if (newMin <= value.max && newMin >= min) {
      onChange({
        min: newMin,
        max: value.max,
      });
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value, 10) || max;
    if (newMax >= value.min && newMax <= max) {
      onChange({
        min: value.min,
        max: newMax,
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Session Price Range
      </Label>
      
      <div className="px-2">
        <Slider
          value={[value.min, value.max]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Min Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={value.min}
              onChange={handleMinInputChange}
              min={min}
              max={value.max}
              step={step}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <Label className="text-xs text-gray-500">Max Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={value.max}
              onChange={handleMaxInputChange}
              min={value.min}
              max={max}
              step={step}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        ${value.min} - ${value.max} per session
      </div>
    </div>
  );
}