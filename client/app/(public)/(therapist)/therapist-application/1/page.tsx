"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingStepper } from "@/components/ui/onboardingstepper";
import { therapistProfileFormFields } from "@/const/therapist_application";
import Image from "next/image";
import useTherapistForm from "@/store/therapistform";

// --- Validation Helper ---
const validateField = (value, rules, allValues) => {
  if (!rules) return null; // No rules to check

  let errorMessage = null;

  // --- Check Required Rule ---
  let isRequired = rules.required;
  // Check conditional requirement
  if (rules.requiredIf) {
    const depFieldKey = rules.requiredIf.fieldKey;
    const depExpectedValue = rules.requiredIf.value; // For radio/input dependency
    const depCheckboxValue = rules.requiredIf.checkboxValue; // For checkbox dependency

    if (depCheckboxValue !== undefined) {
      // Required if a specific checkbox *value* within the group is checked
      isRequired = allValues[depFieldKey]?.[depCheckboxValue] === true;
    } else if (depExpectedValue !== undefined) {
      // Required if a parent radio/input field has a specific value
      isRequired = allValues[depFieldKey] === depExpectedValue;
    }
  }

  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "object" && Object.keys(value).length === 0); // Handle empty objects for checkbox groups potentially

  if (isRequired && isEmpty) {
    // Use specific required message if available
    errorMessage =
      rules.requiredErrorMessage ||
      rules.errorMessage ||
      "This field is required.";
    return errorMessage; // Stop validation if required field is empty
  }

  // --- Skip further validation if not required and empty ---
  if (!isRequired && isEmpty) {
    return null;
  }

  // --- Check other rules only if the field is not empty ---
  if (!isEmpty) {
    // Min Selection (for Checkbox groups)
    if (rules.minSelection && typeof value === "object") {
      const selectedCount = Object.values(value).filter(Boolean).length;
      if (selectedCount < rules.minSelection) {
        errorMessage =
          rules.errorMessage ||
          `Please select at least ${rules.minSelection} option(s).`;
      }
    }
    // Pattern (Regex)
    else if (
      rules.pattern &&
      typeof value === "string" &&
      !rules.pattern.test(value)
    ) {
      errorMessage = rules.errorMessage || "Invalid format.";
    }
    // Min Length
    else if (
      rules.minLength &&
      typeof value === "string" &&
      value.length < rules.minLength
    ) {
      errorMessage =
        rules.errorMessage ||
        `Minimum length is ${rules.minLength} characters.`;
    }
    // Must Be (e.g., require 'yes' for compliance)
    else if (rules.mustBe && value !== rules.mustBe) {
      errorMessage =
        rules.mustBeErrorMessage ||
        rules.errorMessage ||
        `This field must be '${rules.mustBe}'.`;
    }
    // Numeric & Min Value (for type="number") - Basic check
    else if (
      rules.numeric &&
      typeof value !== "string" &&
      typeof value !== "number"
    ) {
      // Allow empty string if not required
      if (!(isRequired === false && value === "")) {
        errorMessage = rules.errorMessage || "Must be a numeric value.";
      }
    } else if (
      rules.numeric &&
      rules.min !== undefined &&
      parseFloat(value) < rules.min
    ) {
      errorMessage =
        rules.errorMessage || `Value cannot be less than ${rules.min}.`;
    }
    // Add other rules here (maxLength, email format, etc.) if needed
  }

  return errorMessage;
};

// --- Custom Components (Updated for error display) ---
const CustomCheckbox = ({
  id,
  label,
  checked,
  onChange,
  disabled,
  hasError,
}) => {
  return (
    <div
      className={`flex items-center w-full p-3 rounded-lg border mb-2 bg-white has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 ${
        hasError ? "border-red-500" : "border-gray-200"
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className={`h-5 w-5 rounded border-gray-300 mr-3 text-green-600 focus:ring-green-500 ${
          hasError ? "border-red-500" : ""
        }`}
        disabled={disabled}
      />
      <Label
        htmlFor={id}
        className={`w-full text-sm font-medium ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${hasError ? "text-red-700" : ""}`}
      >
        {label}
      </Label>
    </div>
  );
};

const CustomRadio = ({ id, label, value, checked, hasError }) => {
  return (
    <Label
      htmlFor={id}
      className={`flex items-center w-full p-3 rounded-lg border mb-2 cursor-pointer transition-colors duration-150 ${
        hasError
          ? "border-red-500 bg-red-50"
          : checked
            ? "bg-green-600 text-white border-green-700"
            : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300"
      }`}
    >
      <RadioGroupItem
        value={value}
        id={id}
        className={`mr-3 h-5 w-5 ${
          hasError
            ? "border-red-500"
            : checked
              ? "border-white text-white"
              : "border-gray-400 text-green-600"
        } focus:ring-green-500 focus:ring-offset-1`}
      />
      <span
        className={`w-full text-sm font-medium ${
          hasError ? "text-red-800" : checked ? "" : ""
        }`}
      >
        {label}
      </span>
    </Label>
  );
};

const CustomInput = ({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
  hasError,
  ...props
}) => {
  return (
    <div className="mb-1 w-full">
      {label && (
        <Label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 ${
            hasError ? "text-red-700" : "text-gray-700"
          }`}
        >
          {label}
        </Label>
      )}
      <Input
        id={id}
        placeholder={placeholder}
        type={type}
        value={value || ""}
        onChange={onChange || (() => {})}
        className={`w-full p-3 rounded-lg border focus:ring-green-500 focus:border-green-500 shadow-sm ${
          hasError ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

const CustomTextarea = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  className = "",
  hasError,
  ...props
}) => {
  return (
    <div className="mb-1 w-full">
      {label && (
        <Label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 ${
            hasError ? "text-red-700" : "text-gray-700"
          }`}
        >
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className={`w-full p-3 rounded-lg border focus:ring-green-500 focus:border-green-500 shadow-sm h-24 ${
          hasError ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

// --- Main Application Component ---
const MentaraApplication = () => {
  const router = useRouter();
  const formRef = useRef(null);

  const steps = [
    { label: "Therapist Profile", completed: true },
    { label: "Document Upload", completed: false },
    { label: "Verification", completed: false },
  ];

  // Get Zustand store methods and state
  const {
    formValues,
    otherSpecify,
    updateField,
    updateOtherSpecify,
    resetForm,
  } = useTherapistForm();

  // Keep errors as local state since they're UI-specific
  const [errors, setErrors] = useState({});

  // --- Handlers ---
  const handleInputChange = (fieldKey, value) => {
    updateField(fieldKey, value);
    // Clear error on change
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (fieldKey, optionValue, checked) => {
    const currentSelection = formValues?.[fieldKey] || {};
    const newSelection = { ...currentSelection, [optionValue]: checked };
    updateField(fieldKey, newSelection);

    // 'accepts' logic for checkbox groups
    if (fieldKey === "accepts") {
      const updatedSelection = { ...newSelection };
      if (optionValue === "all" && checked) {
        const allChecked =
          therapistProfileFormFields.availabilityAndPayment.accepts.options.reduce(
            (acc, opt) => {
              if (opt.value !== "all") acc[opt.value] = true;
              return acc;
            },
            { all: true }
          );
        updateField(fieldKey, allChecked);
      } else if (optionValue !== "all" && !checked) {
        if (updatedSelection.all) {
          updatedSelection.all = false;
          updateField(fieldKey, updatedSelection);
        }
      } else if (optionValue !== "all" && checked) {
        const allOtherOptions =
          therapistProfileFormFields.availabilityAndPayment.accepts.options.filter(
            (opt) => opt.value !== "all"
          );

        const allOthersChecked = allOtherOptions.every(
          (opt) => updatedSelection[opt.value]
        );

        if (allOthersChecked && !updatedSelection.all) {
          updatedSelection.all = true;
          updateField(fieldKey, updatedSelection);
        }
      }
    }

    // Clear error on change
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handleOtherSpecify = (specifyKey, value) => {
    updateOtherSpecify(specifyKey, value);
    // Clear error on change
    if (errors[specifyKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[specifyKey];
        return newErrors;
      });
    }
  };

  // --- Validation Function ---
  const validateForm = () => {
    const newErrors = {};
    const combinedValues = { ...formValues }; // Combine main values

    // Recursive function to traverse config and validate
    const checkNode = (key, configNode) => {
      // If it's a group (no 'type' property), recurse into its children
      if (
        configNode &&
        typeof configNode === "object" &&
        !configNode.type &&
        !configNode.question
      ) {
        Object.entries(configNode).forEach(([nestedKey, nestedConfig]) => {
          checkNode(nestedKey, nestedConfig);
        });
        return;
      }

      // Skip nodes without validation rules or question (likely not actual fields)
      if (
        !configNode ||
        typeof configNode !== "object" ||
        !configNode.question
      ) {
        return;
      }

      // --- Validate the main field ---
      const fieldKey = key;
      const fieldConfig = configNode;
      const fieldValue = combinedValues[fieldKey]; // Get value from state

      // Handle dependency check for *rendering* (already done in renderFormField)
      // We still need to check validation rules *if* the field is rendered/relevant
      const isPrcDependent = [
        "prcLicenseNumber",
        "expirationDateOfLicense",
        "isLicenseActive",
      ].includes(fieldKey);
      const shouldValidateMainField = !(
        isPrcDependent && formValues?.isPRCLicensed !== "yes"
      );

      if (shouldValidateMainField && fieldConfig.validation) {
        const error = validateField(
          fieldValue,
          fieldConfig.validation,
          combinedValues
        );
        if (error) {
          newErrors[fieldKey] = error;
        }
      }

      // --- Validate the 'specify' field if applicable ---
      const specifyInputKey = `${fieldKey}_specify`;
      const specifyConfig = fieldConfig.specifyField; // The config for the specify input itself
      const specifyValue = otherSpecify?.[specifyInputKey]; // Get value from otherSpecify state

      // Determine if the specify field *should* be validated based on parent selection
      let shouldValidateSpecify = false;
      if (specifyConfig?.validation?.requiredIf) {
        const condition = specifyConfig.validation.requiredIf;
        if (condition.checkboxValue !== undefined) {
          shouldValidateSpecify =
            combinedValues[condition.fieldKey]?.[condition.checkboxValue] ===
            true;
        } else if (condition.value !== undefined) {
          shouldValidateSpecify =
            combinedValues[condition.fieldKey] === condition.value;
        }
      } else if (specifyConfig?.validation?.required === true) {
        // Handle non-conditional required specify fields if any exist
        shouldValidateSpecify = true;
      }

      // Perform validation only if the specify field is currently relevant and has rules
      if (shouldValidateSpecify && specifyConfig?.validation) {
        const specifyError = validateField(
          specifyValue,
          specifyConfig.validation,
          combinedValues
        );
        if (specifyError) {
          newErrors[specifyInputKey] = specifyError;
        }
      }
    };

    // Start validation traversal from the root
    Object.entries(therapistProfileFormFields).forEach(([key, config]) => {
      checkNode(key, config);
    });

    return newErrors;
  };

  // --- Handle Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      // Validation successful
      console.log("Validation successful!");
      console.log("Form Data:", { formValues, otherSpecify });

      // TODO: Add logic here to actually save the data (e.g., API call)

      // Navigate to the next step
      router.push("/therapist-application/2");
    } else {
      // Validation failed
      console.log("Validation failed:", validationErrors);
      setErrors(validationErrors);

      // Scroll to the first error field for better UX
      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorElement =
        document.getElementById(firstErrorKey) ||
        document.getElementById(
          `${firstErrorKey}-${
            Object.keys(therapistProfileFormFields).find(
              (k) => k === firstErrorKey
            )?.options?.[0]?.value
          }`
        ) ||
        document.getElementById(`${firstErrorKey}_specify`); // Attempt to find the element by various ID patterns
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Optionally focus the element if it's an input/textarea
        if (
          ["input", "textarea"].includes(errorElement.tagName.toLowerCase())
        ) {
          errorElement.focus({ preventScroll: true });
        }
      } else if (formRef.current) {
        // Fallback: scroll form into view if specific element not found
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // --- Recursive Rendering Function (with error display) ---
  const renderFormField = (fieldKey, fieldConfig) => {
    // --- 1. Handle Nested Groups ---
    if (
      fieldConfig &&
      typeof fieldConfig === "object" &&
      !fieldConfig.type &&
      !fieldConfig.question
    ) {
      const groupTitle = fieldKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      return (
        <div
          key={fieldKey}
          id={fieldKey}
          className="mb-8 p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-white via-gray-50 to-white shadow-sm scroll-mt-20"
        >
          <h2 className="text-xl font-semibold text-green-800 mb-5 border-b pb-2 border-gray-100">
            {groupTitle}
          </h2>
          <div className="space-y-6">
            {Object.entries(fieldConfig).map(([nestedKey, nestedConfig]) =>
              renderFormField(nestedKey, nestedConfig)
            )}
          </div>
        </div>
      );
    }

    // --- 2. Skip rendering if invalid config ---
    if (!fieldConfig || !fieldConfig.question || !fieldConfig.type) return null;

    // --- 3. Handle Field Dependencies (Rendering) ---
    const isPrcDependent = [
      "prcLicenseNumber",
      "expirationDateOfLicense",
      "isLicenseActive",
    ].includes(fieldKey);
    if (isPrcDependent && formValues?.isPRCLicensed !== "yes") return null;

    // --- 4. Determine Specify Logic ---
    const specifyInputKey = `${fieldKey}_specify`;
    let showSpecifyInput = false;
    let specifyConfig = fieldConfig.specifyField || null;
    let requiresSpecifyOption = null;

    if (
      (fieldConfig.type === "radio" || fieldConfig.type === "checkbox") &&
      fieldConfig.options
    ) {
      if (fieldConfig.type === "radio") {
        requiresSpecifyOption = fieldConfig.options.find(
          (opt) => opt.hasSpecify && formValues?.[fieldKey] === opt.value
        );
      } else {
        // checkbox
        const currentSelection = formValues?.[fieldKey] || {};
        requiresSpecifyOption = fieldConfig.options.find(
          (opt) => opt.hasSpecify && currentSelection[opt.value]
        );
        if (requiresSpecifyOption && !requiresSpecifyOption.specifyField)
          specifyConfig = fieldConfig.specifyField || null;
        else if (requiresSpecifyOption?.specifyField)
          specifyConfig = requiresSpecifyOption.specifyField;
      }
      showSpecifyInput = !!requiresSpecifyOption && !!specifyConfig;
    }

    // --- 5. Get Error Messages ---
    const fieldError = errors[fieldKey];
    const specifyError = errors[specifyInputKey];

    // --- 6. Render Based on Type ---
    const commonWrapperClass = "mb-4";

    switch (fieldConfig.type) {
      case "radio":
        return (
          <div
            key={fieldKey}
            id={fieldKey}
            className={`${commonWrapperClass} scroll-mt-20`}
          >
            <Label
              className={`block text-lg font-medium mb-3 ${
                fieldError ? "text-red-700" : "text-green-800"
              }`}
            >
              {fieldConfig.question}
            </Label>
            <RadioGroup
              value={formValues?.[fieldKey] || ""}
              onValueChange={(value) => handleInputChange(fieldKey, value)}
              name={fieldKey}
            >
              {fieldConfig.options.map((option) => (
                <CustomRadio
                  key={option.value}
                  id={`${fieldKey}-${option.value}`}
                  label={option.label}
                  value={option.value}
                  checked={formValues?.[fieldKey] === option.value}
                  hasError={!!fieldError}
                />
              ))}
            </RadioGroup>
            {fieldError && (
              <p className="text-red-600 text-sm mt-1">{fieldError}</p>
            )}
            {/* Specify Input */}
            {showSpecifyInput && (
              <div className="mt-2">
                {specifyConfig.type === "textarea" ? (
                  <CustomTextarea
                    id={specifyInputKey}
                    placeholder={
                      specifyConfig.placeholder || "Please provide details..."
                    }
                    value={otherSpecify?.[specifyInputKey] || ""}
                    onChange={(e) =>
                      handleOtherSpecify(specifyInputKey, e.target.value)
                    }
                    hasError={!!specifyError}
                  />
                ) : (
                  <CustomInput
                    id={specifyInputKey}
                    placeholder={specifyConfig.placeholder || "Please specify"}
                    value={otherSpecify?.[specifyInputKey] || ""}
                    onChange={(e) =>
                      handleOtherSpecify(specifyInputKey, e.target.value)
                    }
                    type={specifyConfig.type || "text"}
                    hasError={!!specifyError}
                  />
                )}
                {specifyError && (
                  <p className="text-red-600 text-sm mt-1">{specifyError}</p>
                )}
              </div>
            )}
          </div>
        );

      case "checkbox":
        const currentSelection = formValues?.[fieldKey] || {};
        return (
          <div
            key={fieldKey}
            id={fieldKey}
            className={`${commonWrapperClass} scroll-mt-20`}
          >
            <Label
              className={`block text-lg font-medium mb-3 ${
                fieldError ? "text-red-700" : "text-green-800"
              }`}
            >
              {fieldConfig.question}
            </Label>
            {fieldConfig.options.map((option) => (
              <CustomCheckbox
                key={option.value}
                id={`${fieldKey}-${option.value}`}
                label={option.label}
                checked={currentSelection[option.value] || false}
                onChange={(checked) =>
                  handleCheckboxChange(fieldKey, option.value, checked)
                }
                disabled={
                  fieldKey === "accepts" &&
                  currentSelection["all"] &&
                  option.value !== "all"
                }
                hasError={!!fieldError}
              />
            ))}
            {fieldError && (
              <p className="text-red-600 text-sm mt-1">{fieldError}</p>
            )}
            {showSpecifyInput && (
              <div className="mt-2">
                <CustomInput
                  id={specifyInputKey}
                  placeholder={specifyConfig.placeholder || "Please specify"}
                  value={otherSpecify?.[specifyInputKey] || ""}
                  onChange={(e) =>
                    handleOtherSpecify(specifyInputKey, e.target.value)
                  }
                  type={specifyConfig.type || "text"}
                  hasError={!!specifyError}
                />
                {specifyError && (
                  <p className="text-red-600 text-sm mt-1">{specifyError}</p>
                )}
              </div>
            )}
          </div>
        );

      case "input":
      case "date":
      case "number":
      case "email":
        return (
          <div
            key={fieldKey}
            id={fieldKey}
            className={`${commonWrapperClass} scroll-mt-20`}
          >
            <CustomInput
              id={fieldKey}
              label={fieldConfig.question}
              placeholder={fieldConfig.placeholder || ""}
              type={fieldConfig.type}
              value={formValues?.[fieldKey] || ""}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              step={fieldKey === "standardSessionRate" ? "0.01" : undefined}
              min={fieldKey === "standardSessionRate" ? "0" : undefined}
              hasError={!!fieldError}
            />
            {fieldError && (
              <p className="text-red-600 text-sm mt-1">{fieldError}</p>
            )}
          </div>
        );

      default:
        console.warn(
          `Unsupported field type "${fieldConfig.type}" for key: ${fieldKey}`
        );
        return (
          <div key={fieldKey}>Unsupported Field: {fieldConfig.question}</div>
        );
    }
  };

  // --- Component Return ---
  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* Left sidebar */}
      <div className="w-1/5 bg-gradient-to-b from-green-100 via-green-50 to-gray-50 p-6 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="mb-8">
          <Image
            src="/mentara-landscape.png"
            alt="Mentara logo"
            width={250}
            height={100}
          />
        </div>
        <div className="mt-4 mb-8">
          <p className="text-sm text-gray-600 mb-1">You're working on</p>
          <h1 className="text-2xl font-bold text-green-900">Application</h1>
        </div>
        <OnboardingStepper steps={steps} />
        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} Mentara. All rights reserved.
        </div>
      </div>

      {/* Right content area - scrollable form */}
      <div className="w-4/5 flex justify-center p-8">
        <div className="w-full max-w-3xl h-full">
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="space-y-8">
              {Object.entries(therapistProfileFormFields).map(
                ([fieldKey, fieldConfig]) =>
                  renderFormField(fieldKey, fieldConfig)
              )}

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 rounded-full bg-green-600 text-white font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                >
                  Save and Continue
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentaraApplication;
