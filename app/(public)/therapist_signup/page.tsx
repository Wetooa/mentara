"use client"; // Add this if not already present

import * as React from "react";
import { useState } from "react"; // Import useState
import { useRouter } from "next/navigation"; // Import useRouter
import Image from "next/image";

// Assuming components are correctly imported from their paths
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Assuming constants are correctly imported
import PHILIPPINE_PROVINCES from "@/const/provinces";
import PROVIDER_TYPE from "@/const/provider";

// --- Child Component Interfaces (Corrected) ---
interface FormInputProps {
  PlaceHolder: string;
  ColumnStart: number; // Keep for clarity, though className handles layout now
  RowStart: number; // Keep for clarity
  Span: boolean; // Keep for clarity
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  type?: string;
  name: string;
  className?: string; // **** Added className property ****
}
interface DropdownProps {
  PlaceHolder: string;
  ColumnStart: number; // Keep for clarity
  RowStart: number; // Keep for clarity
  Span: boolean; // Keep for clarity
  List: string[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string | null;
  name: string;
  className?: string; // **** Added className property ****
}

// --- Re-declare child components here or import them ---
// Using the corrected interfaces and implementation from previous step
function FormInput(props: FormInputProps) {
  const hasError = !!props.error;
  return (
    <div className={`w-full h-fit flex flex-col ${props.className}`}>
      {" "}
      {/* Apply grid classes passed via props.className */}
      <Input
        id={props.name}
        name={props.name}
        className={`w-full h-full text-md border-0 bg-input rounded-4xl p-6 ${
          hasError ? "ring-2 ring-red-500 ring-inset" : ""
        } focus-visible:ring-primary focus-visible:ring-offset-1`}
        placeholder={props.PlaceHolder}
        value={props.value}
        onChange={props.onChange}
        type={props.type || "text"}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${props.name}-error` : undefined}
      />
      {hasError && (
        <p
          id={`${props.name}-error`}
          className="text-red-600 text-sm mt-1 ml-2"
        >
          {props.error}
        </p>
      )}
    </div>
  );
}
function FormDropdown(props: DropdownProps) {
  const hasError = !!props.error;
  return (
    <div className={`w-full h-fit flex flex-col ${props.className}`}>
      {" "}
      {/* Apply grid classes passed via props.className */}
      <Select
        value={props.value} // Bind value (will be "" initially)
        onValueChange={props.onValueChange} // Bind onValueChange
        name={props.name}
      >
        <SelectTrigger
          id={props.name}
          className={`w-full h-full text-md border-0 bg-input rounded-4xl p-6 text-left justify-start ${
            // Ensure text aligns left
            !props.value ? "text-gray-400" : "text-secondary" // Use placeholder color if value is empty
          } ${
            hasError ? "ring-2 ring-red-500 ring-inset" : ""
          } focus:ring-2 focus:ring-primary focus:ring-offset-1`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.name}-error` : undefined}
        >
          {/* This component handles showing the placeholder when value is "" */}
          <SelectValue placeholder={props.PlaceHolder} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl bg-input border-gray-300 text-secondary">
          <SelectGroup>
            {/* REMOVED the <SelectItem value="" disabled...> item */}
            {props.List.map((item) => (
              // Ensure 'item' itself is never an empty string in your constants
              <SelectItem
                className="text-secondary data-[highlighted]:bg-primary data-[highlighted]:text-white cursor-pointer"
                key={item}
                value={item} // Use the actual string value (must not be "")
              >
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {/* Display error message */}
      {hasError && (
        <p
          id={`${props.name}-error`}
          className="text-red-600 text-sm mt-1 ml-2"
        >
          {props.error}
        </p>
      )}
    </div>
  );
}
// --- Main TherapistSignUp Component ---
export default function TherapistSignUp() {
  const router = useRouter(); // Initialize router

  // --- State for Form Fields ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    province: "",
    providerType: "",
  });

  // --- State for Errors ---
  const [errors, setErrors] = useState<Record<string, string | null>>({}); // Type the error state

  // --- Handle Input Change ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- Handle Dropdown Change ---
  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- Validation Logic ---
  const validateForm = (): Record<string, string | null> => {
    const newErrors: Record<string, string | null> = {};
    const phoneRegex = /^(09|\+639)\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!phoneRegex.test(formData.mobile.trim())) {
      newErrors.mobile =
        "Invalid PH mobile number (e.g., 09xxxxxxxxx or +639xxxxxxxxx).";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.province) {
      // Check for empty string from dropdown default
      newErrors.province = "Province is required.";
    }
    if (!formData.providerType) {
      // Check for empty string from dropdown default
      newErrors.providerType = "Provider type is required.";
    }

    // Ensure all keys have a value (null if no error) for the Object.values check
    Object.keys(formData).forEach((key) => {
      if (!(key in newErrors)) {
        newErrors[key] = null;
      }
    });

    return newErrors;
  };

  // --- Handle Form Submit ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default page reload
    setErrors({}); // Clear previous errors visually immediately

    const validationErrors = validateForm();
    setErrors(validationErrors); // Set new errors (or nulls)

    const isValid = Object.values(validationErrors).every(
      (error) => error === null
    );

    if (isValid) {
      // Validation passed
      console.log("Form Submitted Successfully:", formData);
      // TODO: Add API call logic here to submit data

      // Navigate to the next step
      router.push("/therapist-application/1");
    } else {
      // Validation failed
      console.log("Validation Errors:", validationErrors);
      // Optional: Find the first error and scroll to it
      const firstErrorKey = Object.keys(validationErrors).find(
        (key) => validationErrors[key] !== null
      );
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          // Optionally focus, but SelectTrigger might not behave as expected with .focus()
          // errorElement.focus({ preventScroll: true });
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-16 md:gap-24 lg:gap-36 bg-gradient-to-b from-tertiary to-transparent min-h-screen pb-20">
      {/* Header */}
      <div className="w-full flex items-center justify-center bg-white h-20 md:h-24 lg:h-28 drop-shadow-lg">
        <Image
          src="/mentara-landscape.png" // Ensure this path is correct
          width={280} // Adjust size as needed
          height={60} // Adjust size as needed
          alt="mentara landscape logo"
          priority // Load logo faster
        />
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 h-full flex flex-col items-center gap-8 md:gap-12 scroll-mt-20">
        {" "}
        {/* Added scroll-mt */}
        {/* Intro Text */}
        <div className="flex flex-col gap-2 items-center justify-center text-center max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-secondary">
            Join Our Community of Compassionate Therapists
          </h1>
          <p className="text-sm md:text-md text-secondary">
            Tell us a bit about yourself, and we'll guide you through the next
            steps to connect with those who need your support.
          </p>
        </div>
        {/* Form Card */}
        {/* Wrap with form element */}
        <form
          onSubmit={handleSubmit}
          noValidate // Prevent browser default validation
          className="w-full max-w-2xl lg:max-w-3xl bg-card p-8 md:p-12 drop-shadow-2xl flex flex-col gap-8 rounded-2xl"
        >
          <span className="text-xl text-secondary font-bold border-b border-gray-200 pb-2">
            Your Information
          </span>

          <div className="w-full h-fit grid gap-x-6 gap-y-4 md:gap-y-6 grid-cols-1 md:grid-cols-2">
            {" "}
            {/* Adjusted gaps and layout */}
            <FormInput
              PlaceHolder="First Name"
              ColumnStart={1}
              RowStart={1}
              Span={false} // Kept for reference
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              name="firstName"
              className="md:col-span-1" // Tailwind grid classes applied here
            />
            <FormInput
              PlaceHolder="Last Name"
              ColumnStart={2}
              RowStart={1}
              Span={false} // Kept for reference
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              name="lastName"
              className="md:col-span-1"
            />
            <FormInput
              PlaceHolder="Mobile Phone Number (e.g., 09xxxxxxxxx)"
              ColumnStart={1}
              RowStart={2}
              Span={true} // Kept for reference
              value={formData.mobile}
              onChange={handleInputChange}
              error={errors.mobile}
              name="mobile"
              type="tel"
              className="col-span-1 md:col-span-2"
            />
            <FormInput
              PlaceHolder="Email Address"
              ColumnStart={1}
              RowStart={3}
              Span={true} // Kept for reference
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              name="email"
              type="email"
              className="col-span-1 md:col-span-2"
            />
            <FormDropdown
              PlaceHolder="Province"
              ColumnStart={1}
              RowStart={4}
              Span={false} // Kept for reference
              List={PHILIPPINE_PROVINCES}
              value={formData.province}
              onValueChange={(value) => handleDropdownChange("province", value)}
              error={errors.province}
              name="province"
              className="md:col-span-1"
            />
            <FormDropdown
              PlaceHolder="Provider Type"
              ColumnStart={2}
              RowStart={4}
              Span={false} // Kept for reference
              List={PROVIDER_TYPE}
              value={formData.providerType}
              onValueChange={(value) =>
                handleDropdownChange("providerType", value)
              }
              error={errors.providerType}
              name="providerType"
              className="md:col-span-1"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit" // Change to type="submit"
            className="w-full md:w-1/2 lg:w-1/3 h-12 bg-secondary text-white drop-shadow-xl rounded-full self-center hover:bg-opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
