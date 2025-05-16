"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useTherapistForm from "@/store/therapistform";

// Import components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import PROVIDER_TYPE from "@/constants/provider";
import PHILIPPINE_PROVINCES from "@/constants/provinces";

// Component interfaces
interface FormInputProps {
  PlaceHolder: string;
  ColumnStart: number;
  RowStart: number;
  Span: boolean;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  type?: string;
  name: string;
  className?: string;
}

interface DropdownProps {
  PlaceHolder: string;
  ColumnStart: number;
  RowStart: number;
  Span: boolean;
  List: string[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string | null;
  name: string;
  className?: string;
}

// Form components
function FormInput(props: FormInputProps) {
  const hasError = !!props.error;
  return (
    <div className={`w-full h-fit flex flex-col ${props.className}`}>
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
      <Select
        value={props.value}
        onValueChange={props.onValueChange}
        name={props.name}
      >
        <SelectTrigger
          id={props.name}
          className={`w-full h-full text-md border-0 bg-input rounded-4xl p-6 text-left justify-start ${
            !props.value ? "text-gray-400" : "text-secondary"
          } ${
            hasError ? "ring-2 ring-red-500 ring-inset" : ""
          } focus:ring-2 focus:ring-primary focus:ring-offset-1`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.name}-error` : undefined}
        >
          <SelectValue placeholder={props.PlaceHolder} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl bg-input border-gray-300 text-secondary">
          <SelectGroup>
            {props.List.map((item) => (
              <SelectItem
                className="text-secondary data-[highlighted]:bg-primary data-[highlighted]:text-white cursor-pointer"
                key={item}
                value={item}
              >
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
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

export default function TherapistSignUp() {
  // Access Zustand store
  const { formValues, updateField, resetForm } = useTherapistForm();

  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Add useEffect to reset form on component mount (optional)
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  // Add this reset handler function
  const handleReset = () => {
    resetForm();
    setErrors({});
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleDropdownChange = (name: string, value: string) => {
    updateField(name, value);
  };

  const validateForm = (): Record<string, string | null> => {
    const newErrors: Record<string, string | null> = {};
    const phoneRegex = /^(09|\+639)\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formValues?.firstName?.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formValues?.lastName?.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!formValues?.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!phoneRegex.test(formValues.mobile.trim())) {
      newErrors.mobile =
        "Invalid PH mobile number (e.g., 09xxxxxxxxx or +639xxxxxxxxx).";
    }
    if (!formValues?.email?.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formValues.email.trim())) {
      newErrors.email = "Invalid email format.";
    }
    if (!formValues?.province) {
      newErrors.province = "Province is required.";
    }
    if (!formValues?.providerType) {
      newErrors.providerType = "Provider type is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== null
    );

    if (!hasErrors) {
      console.log("Form Submitted Successfully:", formValues);
      router.push("/therapist-application/1");
    } else {
      console.log("Validation Errors:", validationErrors);
      const firstErrorKey = Object.keys(validationErrors).find(
        (key) => validationErrors[key] !== null
      );
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-16 md:gap-24 lg:gap-36 bg-gradient-to-b from-tertiary to-transparent min-h-screen pb-20">
      {/* Header */}
      <div className="w-full flex items-center justify-center bg-white h-20 md:h-24 lg:h-28 drop-shadow-lg">
        <Image
          src="/mentara-landscape.png"
          width={280}
          height={60}
          alt="mentara landscape logo"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 h-full flex flex-col items-center gap-8 md:gap-12 scroll-mt-20">
        <div className="flex flex-col gap-2 items-center justify-center text-center max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-secondary">
            Join Our Community of Compassionate Therapists
          </h1>
          <p className="text-sm md:text-md text-secondary">
            Tell us a bit about yourself, and we'll guide you through the next
            steps to connect with those who need your support.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-2xl lg:max-w-3xl bg-card p-8 md:p-12 drop-shadow-2xl flex flex-col gap-8 rounded-2xl"
        >
          <span className="text-xl text-secondary font-bold border-b border-gray-200 pb-2">
            Your Information
          </span>

          <div className="w-full h-fit grid gap-x-6 gap-y-4 md:gap-y-6 grid-cols-1 md:grid-cols-2">
            <FormInput
              PlaceHolder="First Name"
              ColumnStart={1}
              RowStart={1}
              Span={false}
              value={formValues?.firstName || ""}
              onChange={handleInputChange}
              error={errors.firstName}
              name="firstName"
              className="md:col-span-1"
            />
            <FormInput
              PlaceHolder="Last Name"
              ColumnStart={2}
              RowStart={1}
              Span={false}
              value={formValues?.lastName || ""}
              onChange={handleInputChange}
              error={errors.lastName}
              name="lastName"
              className="md:col-span-1"
            />
            <FormInput
              PlaceHolder="Mobile Phone Number (e.g., 09xxxxxxxxx)"
              ColumnStart={1}
              RowStart={2}
              Span={true}
              value={formValues?.mobile || ""}
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
              Span={true}
              value={formValues?.email || ""}
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
              Span={false}
              List={PHILIPPINE_PROVINCES}
              value={formValues?.province || ""}
              onValueChange={(value) => handleDropdownChange("province", value)}
              error={errors.province}
              name="province"
              className="md:col-span-1"
            />
            <FormDropdown
              PlaceHolder="Provider Type"
              ColumnStart={2}
              RowStart={4}
              Span={false}
              List={PROVIDER_TYPE}
              value={formValues?.providerType || ""}
              onValueChange={(value) =>
                handleDropdownChange("providerType", value)
              }
              error={errors.providerType}
              name="providerType"
              className="md:col-span-1"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-1/2 lg:w-1/3 h-12 bg-secondary text-white drop-shadow-xl rounded-full self-center hover:bg-opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
