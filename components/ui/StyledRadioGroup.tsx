import React from "react";
import {
  RadioGroup as ShadcnRadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface StyledRadioGroupProps {
  label?: string;
  name: string;
  options: string[];
}

const StyledRadioGroup: React.FC<StyledRadioGroupProps> = ({
  label,
  name,
  options,
}) => (
  <div className="grid gap-2">
    {label && (
      <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </Label>
    )}
    <ShadcnRadioGroup className="grid grid-cols-1 gap-2">
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem
            value={option}
            id={`${name}-${option}`}
            className="peer appearance-none w-4 h-4 rounded-full border border-gray-300 checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-500"
          />
          <Label
            htmlFor={`${name}-${option}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option}
          </Label>
        </div>
      ))}
    </ShadcnRadioGroup>
  </div>
);

export default StyledRadioGroup;
