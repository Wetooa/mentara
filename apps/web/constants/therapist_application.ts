export const therapistProfileFormFields = {
  professionalLicenseType: {
    question: "What is your professional license type?",
    type: "radio",
    options: [
      { label: "RPsy (Registered Psychologist)", value: "rpsy" },
      { label: "RPm (Registered Psychometrician)", value: "rpm" },
      { label: "RGC (Registered Guidance Counselor)", value: "rgc" },
      { label: "Others (Please specify)", value: "other", hasSpecify: true },
    ],
    specifyField: {
      placeholder: "Please specify your license type",
      // Specify field required *if* parent value is 'other'
      validation: {
        requiredIf: { fieldKey: "professionalLicenseType", value: "other" },
        errorMessage: "Please specify your license type.",
      },
    },
    validation: {
      required: true,
      errorMessage: "Please select your professional license type.",
    },
  },
  prcLicenseNumber: {
    question: "PRC License Number",
    type: "input",
    placeholder: "Enter your PRC license number",
    validation: {
      required: true,
      errorMessage: "Please enter your PRC license number.",
    },
  },
  expirationDateOfLicense: {
    question: "Expiration Date of License",
    type: "date",
    validation: {
      required: true,
      errorMessage: "Please enter the license expiration date.",
    },
  },
  // --- Group: Teletherapy Readiness ---
  teletherapyReadiness: {
    // Sub-fields within the group
    providedOnlineTherapyBefore: {
      question: "Have you provided online therapy before?",
      type: "radio",
      options: [
        /* Yes/No options */ { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      validation: {
        required: true,
        errorMessage: "Please answer this question.",
      },
    },
    comfortableUsingVideoConferencing: {
      question:
        "Are you comfortable using secure video conferencing tools (e.g., Zoom, Google Meet)?",
      type: "radio",
      options: [
        /* Yes/No options */ { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      validation: {
        required: true,
        errorMessage: "Please answer this question.",
      },
    },
    privateConfidentialSpace: {
      question:
        "Do you have a private and confidential space for conducting virtual sessions?",
      type: "radio",
      options: [
        /* Yes/No options */ { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      validation: {
        required: true,
        errorMessage: "Please answer this question.",
      },
    },
    compliesWithDataPrivacyAct: {
      question:
        "Do you comply with the Philippine Data Privacy Act (RA 10173)?",
      type: "radio",
      options: [
        /* Yes/No options */ { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      validation: {
        required: true,
        errorMessage: "Please confirm compliance with the Data Privacy Act.",
      },
    },
  },
  // --- End Group ---
  areasOfExpertise: {
    question: "Areas of Expertise (Check all that apply)",
    type: "checkbox",
    options: [
      /* Many options... */ { label: "Stress", value: "stress" },
      { label: "Anxiety", value: "anxiety" },
      { label: "Depression", value: "depression" },
      { label: "Insomnia", value: "insomnia" },
      { label: "Panic", value: "panic" },
      { label: "Bipolar Disorder (BD)", value: "bipolar" },
      { label: "Obsessive Compulsive Disorder (OCD)", value: "ocd" },
      { label: "Post-Traumatic Stress Disorder (PTSD)", value: "ptsd" },
      { label: "Social Anxiety", value: "social-anxiety" },
      { label: "Phobia", value: "phobia" },
      { label: "Burnout", value: "burnout" },
      { label: "Binge Eating / Eating Disorder", value: "eating-disorder" },
      { label: "ADD / ADHD", value: "adhd" },
      { label: "Substance Use Issues", value: "substance-use" },
      { label: "Drug Use Issues", value: "drug-use" },
    ],
    validation: {
      // Requires at least one checkbox to be selected
      required: true,
      minSelection: 1, // Custom rule identifier for checkbox groups
      errorMessage: "Please select at least one area of expertise.",
    },
  },

  yearsOfExperience: {
    question:
      "How many years of experience do you have as a licensed therapist?",
    type: "radio",
    options: [
      /* 0-2, 3-5, 6-10, 10+ options */ { label: "0–2 years", value: "0-2" },
      { label: "3–5 years", value: "3-5" },
      { label: "6–10 years", value: "6-10" },
      { label: "10+ years", value: "10+" },
    ],
    validation: {
      required: true,
      errorMessage: "Please select your years of experience.",
    },
  },
  therapeuticApproachesUsedList: {
    question: "Therapeutic Approaches Used (Check all that apply)",
    type: "checkbox",
    options: [
      /* CBT, DBT, etc... */
      { label: "CBT (Cognitive Behavioral Therapy)", value: "cbt" },
      { label: "DBT (Dialectical Behavior Therapy)", value: "dbt" },
      { label: "Person-Centered", value: "person-centered" },
      { label: "Psychodynamic", value: "psychodynamic" },
      { label: "Narrative Therapy", value: "narrative" },
      { label: "Mindfulness-Based Therapy", value: "mindfulness" },
      { label: "Solution-Focused Brief Therapy", value: "solution-focused" },
      { label: "Others (please specify)", value: "other", hasSpecify: true },
    ],
    specifyField: {
      placeholder: "Please specify other approaches",
      validation: {
        requiredIf: {
          fieldKey: "therapeuticApproachesUsedList",
          checkboxValue: "other",
        }, // Check if 'other' checkbox is true
        errorMessage: "Please specify the other therapeutic approaches used.",
      },
    },
    validation: {
      required: true,
      minSelection: 1,
      errorMessage: "Please select at least one therapeutic approach.",
    },
  },
  languagesOffered: {
    question: "Languages Offered in Therapy",
    type: "checkbox",
    options: [
      /* English, Filipino, etc... */ { label: "English", value: "english" },
      { label: "Filipino", value: "filipino" },
      { label: "Cebuano", value: "cebuano" },
      { label: "Ilocano", value: "ilocano" },
      { label: "Hiligaynon", value: "hiligaynon" },
      { label: "Others (please specify)", value: "other", hasSpecify: true },
    ],
    specifyField: {
      placeholder: "Please specify other languages",
      validation: {
        requiredIf: { fieldKey: "languagesOffered", checkboxValue: "other" },
        errorMessage: "Please specify the other languages offered.",
      },
    },
    validation: {
      required: true,
      minSelection: 1,
      errorMessage: "Please select at least one language offered.",
    },
  },
  // --- Group: Availability & Payment ---
  availabilityAndPayment: {
    weeklyAvailability: {
      question: "Weekly availability for online sessions:",
      type: "radio",
      options: [
        /* 5-10, 11-20, etc options */ { label: "5–10 hours", value: "5-10" },
        { label: "11–20 hours", value: "11-20" },
        { label: "21–30 hours", value: "21-30" },
        { label: "30+ hours", value: "30+" },
      ],
      validation: {
        required: true,
        errorMessage: "Please select your weekly availability.",
      },
    },
    preferredSessionLength: {
      question: "Preferred session length:",
      type: "checkbox",
      options: [
        /* 30, 45, 60 min, Other options */
        { label: "30 minutes", value: "30" },
        { label: "45 minutes", value: "45" },
        { label: "60 minutes", value: "60" },
        { label: "Other: _______", value: "other", hasSpecify: true },
      ],
      specifyField: {
        placeholder: "Specify other length (e.g., 90 minutes)",
        type: "input", // Or 'number' if you want numeric input
        validation: {
          requiredIf: { fieldKey: "preferredSessionLength", checkboxValue: "other" },
          errorMessage: "Please specify your preferred session length.",
        },
      },
      validation: {
        required: true,
        minSelection: 1,
        errorMessage: "Please select at least one preferred session length.",
      },
    },
    preferOnlineOrOffline: {
      question: "Session Format Preference:",
      type: "radio",
      options: [
        { label: "Online Only", value: "ONLINE" },
        { label: "Face-to-Face Only", value: "OFFLINE" },
        { label: "Both Online and Face-to-Face", value: "BOTH" },
      ],
      validation: {
        required: true,
        errorMessage: "Please select your preference.",
      },
    },
    willingToCaterOutsideCebu: {
      question: "Are you willing to cater to clients outside Cebu?",
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      validation: {
        required: true,
        errorMessage: "Please indicate your willingness.",
      },
    },
    preferredPayrollAccount: {
      question: "Preferred Payroll Account (e.g., Bank Name, Account Number, GCash):",
      type: "input",
      placeholder: "Enter details for your payouts",
      validation: {
        required: true,
        errorMessage: "Please provide your preferred payroll account.",
      },
    },
    standardSessionRate: {
      question: "Standard session rate (PHP, optional):",
      type: "number", // Changed to number
      placeholder: "Enter amount (e.g., 1500)",
      validation: {
        numeric: true,
        min: 0, // Cannot be negative
        errorMessage: "Please enter a valid session rate (numeric value).",
      },
    },
  },
  // --- End Group ---
  // --- Group: Compliance ---
  compliance: {

    complaintsOrDisciplinaryActions: {
      question:
        "Have you ever had complaints or disciplinary actions against your PRC license?",
      type: "radio",
      options: [
        /* No, Yes options */ { label: "No", value: "no" },
        {
          label: "Yes (please briefly explain): _______",
          value: "yes",
          hasSpecify: true,
        },
      ],
      specifyField: {
        placeholder: "Briefly explain the nature and resolution",
        type: "textarea",
        validation: {
          requiredIf: {
            fieldKey: "complaintsOrDisciplinaryActions",
            value: "yes",
          },
          minLength: 10, // Example minimum length for explanation
          errorMessage:
            "Please provide a brief explanation (min. 10 characters).",
          requiredErrorMessage:
            "Explanation is required if you answered 'Yes'.",
        },
      },
      validation: {
        required: true,
        errorMessage: "Please answer regarding complaints history.",
      },
    },
    willingToAbideByPlatformGuidelines: {
      question:
        "Are you willing to abide by our platform’s ethical guidelines, privacy policies, and patient safety standards?",
      type: "radio",
      options: [
        /* Yes, No options */ { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      validation: {
        required: true,
        // Potentially require 'yes' to submit the application
        mustBe: "yes", // Custom rule identifier
        errorMessage: "Confirmation is required.",
        mustBeErrorMessage:
          "You must agree to abide by the platform guidelines to proceed.",
      },
    },
  },
  // --- End Group ---
};
