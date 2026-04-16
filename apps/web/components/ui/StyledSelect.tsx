import React from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StyledSelectProps {
  label?: string;
  id?: string;
  options: string[];
}

const StyledSelect: React.FC<StyledSelectProps> = ({ label, id, options }) => (
  <div className="grid gap-2">
    {label && (
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    )}
    <ShadcnSelect>
      <SelectTrigger
        id={id}
        className="w-full bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        <span>Select an option</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  </div>
);

export default StyledSelect;
