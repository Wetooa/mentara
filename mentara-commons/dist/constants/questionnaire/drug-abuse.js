"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scoring_1 = require("../scoring");
const DAST_10 = {
    title: "Drug Abuse Screening Test (DAST-10)",
    description: "The Drug Abuse Screening Test (DAST-10) is a self-administered questionnaire designed to assess drug use and its potential consequences over the past 12 months. It is used for screening and evaluating substance use disorders.",
    questions: [
        {
            prefix: "",
            question: "Have you used drugs other than those required for medical reasons?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Do you use more than one drug at a time?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Are you always able to stop using drugs when you want to?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Have you had 'blackouts' or 'flashbacks' as a result of drug use?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Do you ever feel bad or guilty about your drug use?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Does your spouse (or parents) ever complain about your involvement with drugs?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Have you neglected your family because of your use of drugs?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Have you engaged in illegal activities in order to obtain drugs?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?",
            options: ["Yes", "No"],
        },
        {
            prefix: "",
            question: "Have you had medical problems as a result of your drug use (e.g., memory loss, hepatitis, convulsions, bleeding, etc.)?",
            options: ["Yes", "No"],
        },
    ],
    scoring: {
        ...scoring_1.QUESTIONNAIRE_SCORING,
        scoreMapping: { 0: 1, 1: 0 },
        severityLevels: {
            none: { range: [0, 0], label: "No problems reported" },
            low: { range: [1, 2], label: "Low level - Monitor, reassess later" },
            moderate: {
                range: [3, 5],
                label: "Moderate level - Further investigation",
            },
            substantial: {
                range: [6, 8],
                label: "Substantial level - Intensive assessment",
            },
            severe: { range: [9, 10], label: "Severe level - Intensive assessment" },
        },
        getSeverity: (score) => {
            if (score === 0)
                return "No problems reported";
            if (score >= 1 && score <= 2)
                return "Low level - Monitor, reassess later";
            if (score >= 3 && score <= 5)
                return "Moderate level - Further investigation";
            if (score >= 6 && score <= 8)
                return "Substantial level - Intensive assessment";
            if (score >= 9 && score <= 10)
                return "Severe level - Intensive assessment";
            return "Invalid score";
        },
    },
    disclaimer: "This questionnaire is a screening tool for substance use disorders and does not provide a definitive diagnosis. A clinical evaluation by a healthcare professional is necessary for a formal assessment.",
};
exports.default = DAST_10;
//# sourceMappingURL=drug-abuse.js.map