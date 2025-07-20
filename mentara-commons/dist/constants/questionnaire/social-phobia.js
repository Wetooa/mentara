"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scoring_1 = require("../scoring");
const SPIN = {
    title: "Social Phobia Inventory (SPIN)",
    description: "The Social Phobia Inventory (SPIN) is a self-administered questionnaire developed by Duke University's Psychiatry and Behavioral Sciences Department. It is used to screen for and measure the severity of social anxiety disorder.",
    questions: [
        {
            prefix: "",
            question: "I am afraid of people in authority.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I am bothered by blushing in front of people.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Parties and social events scare me.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I avoid talking to people I don’t know.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Being criticized scares me a lot.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I avoid doing things or speaking to people for fear of embarrassment.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Sweating in front of people causes me distress.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I avoid going to parties.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I avoid activities in which I am the center of attention.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Talking to strangers scares me.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I avoid having to give speeches.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I would do anything to avoid being criticized.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Heart palpitations bother me when I am around people.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I am afraid of doing things when people might be watching.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Being embarrassed or looking stupid are among my worst fears.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "I avoid speaking to anyone in authority.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
        {
            prefix: "",
            question: "Trembling or shaking in front of others is distressing to me.",
            options: [
                "Not at all",
                "A little",
                "Moderately",
                "Quite a bit",
                "Extremely",
            ],
        },
    ],
    scoring: {
        ...scoring_1.QUESTIONNAIRE_SCORING,
        scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
        severityLevels: {
            minimal: { range: [0, 20], label: "Minimal or No Social Phobia" },
            mild: { range: [21, 30], label: "Mild Social Phobia" },
            moderate: { range: [31, 40], label: "Moderate Social Phobia" },
            severe: { range: [41, 50], label: "Severe Social Phobia" },
            verySevere: { range: [51, 68], label: "Very Severe Social Phobia" },
        },
    },
    disclaimer: "This questionnaire is a screening tool to assess the severity of social anxiety disorder. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your mental health, please consult a healthcare professional.",
};
exports.default = SPIN;
//# sourceMappingURL=social-phobia.js.map