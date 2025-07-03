import { useMemo } from "react";

interface SectionCompletion {
  completed: number;
  total: number;
  percentage: number;
}

interface Document {
  [key: string]: File[];
}

interface FormValues {
  [key: string]: any;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  fields: string[];
  isRequired: boolean;
}

export function useSectionCompletion(
  values: FormValues,
  documents: Document,
  sections: Section[]
): Record<string, SectionCompletion> {
  return useMemo(() => {
    const completions: Record<string, SectionCompletion> = {};

    sections.forEach((section) => {
      let completed = 0;
      let total = section.fields.length;

      switch (section.id) {
        case "basicInfo":
          const basicFields = [
            "firstName",
            "lastName",
            "mobile",
            "email",
            "province",
            "providerType",
            "practiceStartDate",
            "yearsOfExperience",
            "educationBackground",
            "practiceLocation",
          ];
          completed = basicFields.filter((field) => {
            if (field === "yearsOfExperience") {
              return values[field] !== undefined && values[field] !== null;
            }
            return values[field] && values[field].toString().trim() !== "";
          }).length;
          total = basicFields.length;
          break;

        case "licenseInfo":
          const licenseRequiredFields = [
            "professionalLicenseType",
            "isPRCLicensed",
          ];

          let licenseCompleted = licenseRequiredFields.filter(
            (field) => values[field] && values[field] !== ""
          ).length;

          // Add conditional fields
          if (
            values.isPRCLicensed === "yes" &&
            values.prcLicenseNumber &&
            values.expirationDateOfLicense &&
            values.isLicenseActive
          ) {
            licenseCompleted += 3;
            total += 3;
          }

          if (
            values.professionalLicenseType === "other" &&
            values.professionalLicenseType_specify
          ) {
            licenseCompleted++;
            total += 1;
          }

          completed = licenseCompleted;
          break;

        case "teletherapy":
          const teletherapyFields = [
            "providedOnlineTherapyBefore",
            "comfortableUsingVideoConferencing",
            "privateConfidentialSpace",
            "compliesWithDataPrivacyAct",
          ];
          completed = teletherapyFields.filter(
            (field) => values[field] && values[field] !== ""
          ).length;
          total = teletherapyFields.length;
          break;

        case "professionalProfile":
          const professionalRequiredFields = [
            "areasOfExpertise",
            "assessmentTools",
            "therapeuticApproachesUsedList",
            "languagesOffered",
            "professionalLiabilityInsurance",
            "complaintsOrDisciplinaryActions",
            "willingToAbideByPlatformGuidelines",
          ];

          let profCompleted = 0;

          professionalRequiredFields.forEach((field) => {
            if (
              field === "areasOfExpertise" ||
              field === "assessmentTools" ||
              field === "therapeuticApproachesUsedList" ||
              field === "languagesOffered"
            ) {
              if (values[field]?.length > 0) profCompleted++;
            } else if (field === "willingToAbideByPlatformGuidelines") {
              if (values[field] === "yes") profCompleted++;
            } else {
              if (values[field] && values[field] !== "") profCompleted++;
            }
          });

          completed = profCompleted;
          total = professionalRequiredFields.length;
          break;

        case "availability":
          const availabilityRequiredFields = [
            "weeklyAvailability",
            "preferredSessionLength",
            "accepts",
          ];

          let availCompleted = 0;

          availabilityRequiredFields.forEach((field) => {
            if (field === "accepts") {
              if (values[field]?.length > 0) availCompleted++;
            } else {
              if (values[field] && values[field] !== "") availCompleted++;
            }
          });

          completed = availCompleted;
          total = availabilityRequiredFields.length;
          break;

        case "documents":
          const requiredDocs = ["prcLicense", "nbiClearance", "resumeCV"];
          const uploadedDocs = requiredDocs.filter(
            (doc) => documents[doc]?.length > 0
          ).length;

          completed = uploadedDocs;
          total = requiredDocs.length;
          break;

        case "review":
          completed = values.consentChecked ? 1 : 0;
          total = 1;
          break;
      }

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      completions[section.id] = { completed, total, percentage };
    });

    return completions;
  }, [values, documents, sections]);
}