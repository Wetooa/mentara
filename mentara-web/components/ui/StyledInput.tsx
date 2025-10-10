import React from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const StyledInput: React.FC<StyledInputProps> = ({ label, id, ...props }) => (
  <div className="grid gap-2">
    {label && (
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    )}
    <ShadcnInput
      id={id}
      className="bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      {...props}
    />
  </div>
);

export default StyledInput;
