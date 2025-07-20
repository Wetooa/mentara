"use strict";
// interface SeverityLevel {
//   range: number[];
//   label: string;
// }
//
// interface SeverityLevels {
//   low: SeverityLevel;
//   mildToModerate: SeverityLevel;
//   high: SeverityLevel;
//   veryHigh: SeverityLevel;
// }
//
// interface Scoring {
//   scoreOptions: Record<number, number>;
//   partA: { range: number[]; severityLevels: SeverityLevels };
//   partB: { range: number[]; severityLevels: SeverityLevels };
//   totalScore: { range: number[]; severityLevels: SeverityLevels };
//   getSeverity: (score: number, part: "A" | "B" | "Total") => string;
// }
//
// const ASRS_V1_1 = {
//   title: "Adult ADHD Self-Report Scale (ASRS v1.1)",
//   description:
//     "The Adult ADHD Self-Report Scale (ASRS v1.1) is a self-administered questionnaire used to screen for ADHD symptoms in adults over the past 6 months. It assesses inattentiveness, hyperactivity, and impulsivity based on DSM-5 criteria.",
//
//   questions: [
//     {
//       prefix: "",
//       question:
//         "Trouble wrapping up final details of a project after the challenging parts are done",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Difficulty getting things in order when a task requires organization",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Problems remembering appointments or obligations",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Avoiding or delaying starting tasks that require a lot of thought",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Fidgeting or squirming when sitting for a long time",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Feeling overly active and compelled to do things, like being driven by a motor",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Making careless mistakes when working on a boring or difficult project",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Difficulty keeping attention during boring or repetitive tasks",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Difficulty concentrating on conversations, even when spoken to directly",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question:
//         "Misplacing or having difficulty finding things at home or work",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Being easily distracted by activity or noise",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Leaving seat in situations where remaining seated is expected",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Feeling restless or fidgety",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Difficulty unwinding and relaxing when having free time",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Talking too much in social situations",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Finishing other people’s sentences before they can finish",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Difficulty waiting turn in situations requiring turn-taking",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//     {
//       prefix: "",
//       question: "Interrupting others when they are busy",
//       options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
//     },
//   ],
//
//   scoring: {
//     scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
//     partA: {
//       range: [0, 24],
//       severityLevels: {
//         low: { range: [0, 9], label: "Low" },
//         mildToModerate: { range: [10, 13], label: "Mild to Moderate" },
//         high: { range: [14, 17], label: "High" },
//         veryHigh: { range: [18, 24], label: "Very High" },
//       },
//     },
//     partB: {
//       range: [0, 48],
//       severityLevels: {
//         low: { range: [0, 19], label: "Low" },
//         mildToModerate: { range: [20, 26], label: "Mild to Moderate" },
//         high: { range: [27, 32], label: "High" },
//         veryHigh: { range: [33, 48], label: "Very High" },
//       },
//     },
//
//     totalScore: {
//       range: [0, 72],
//       severityLevels: {
//         low: { range: [0, 30], label: "Low" },
//         mildToModerate: { range: [31, 39], label: "Mild to Moderate" },
//         high: { range: [40, 49], label: "High" },
//         veryHigh: { range: [50, 72], label: "Very High" },
//       },
//     },
//
//     getSeverity: (score: number, part: "A" | "B" | "Total"): string => {
//       const ranges: SeverityLevels =
//         part === "A"
//           ? ASRS_V1_1.scoring.partA.severityLevels
//           : part === "B"
//             ? ASRS_V1_1.scoring.partB.severityLevels
//             : ASRS_V1_1.scoring.totalScore.severityLevels;
//
//       for (const key of Object.keys(ranges) as (keyof SeverityLevels)[]) {
//         if (score >= ranges[key].range[0] && score <= ranges[key].range[1]) {
//           return ranges[key].label;
//         }
//       }
//       return "Invalid score";
//     },
//   },
//
//   disclaimer:
//     "This questionnaire is a screening tool and does not provide a definitive diagnosis. A clinical evaluation by a healthcare professional is necessary for a formal ADHD diagnosis.",
// };
Object.defineProperty(exports, "__esModule", { value: true });
const scoring_1 = require("../scoring");
const ASRS_V1_1 = {
    title: "Adult ADHD Self-Report Scale (ASRS v1.1)",
    description: "The Adult ADHD Self-Report Scale (ASRS v1.1) is a self-administered questionnaire used to screen for ADHD symptoms in adults over the past 6 months. It assesses inattentiveness, hyperactivity, and impulsivity based on DSM-5 criteria.",
    questions: [
        {
            prefix: "Daily Tasks",
            question: "How often do you have trouble wrapping up the final details of a project once the challenging parts have been done?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Organization",
            question: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Memory",
            question: "How often do you have problems remembering appointments or obligations?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Task Initiation",
            question: "How often do you avoid or delay getting started on a task that requires a lot of thought?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Motor Activity",
            question: "How often do you fidget or squirm with your hands or feet when you have to sit still for a long time?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Hyperactivity",
            question: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Attention to Detail",
            question: "How often do you make careless mistakes when working on a boring or difficult project?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Sustained Attention",
            question: "How often do you have difficulty maintaining your attention when doing boring or repetitive work?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Listening",
            question: "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Organization",
            question: "How often do you misplace or have difficulty finding things at home or at work?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Distractibility",
            question: "How often are you distracted by activity or noise around you?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Restlessness",
            question: "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Inner Restlessness",
            question: "How often do you feel restless or fidgety?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Relaxation",
            question: "How often do you have difficulty unwinding and relaxing when you have time to yourself?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Social Interaction",
            question: "How often do you find yourself talking too much when you are in social situations?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Impulsivity",
            question: "How often do you finish other people's sentences before they can finish them themselves?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Patience",
            question: "How often do you have difficulty waiting your turn in situations when turn-taking is required?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
        {
            prefix: "Social Boundaries",
            question: "How often do you interrupt others when they are busy?",
            options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        },
    ],
    scoring: {
        ...scoring_1.QUESTIONNAIRE_SCORING,
        scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
        severityLevels: {
            low: { range: [0, 30], label: "Low" },
            mildToModerate: { range: [31, 39], label: "Mild to Moderate" },
            high: { range: [40, 49], label: "High" },
            veryHigh: { range: [50, 72], label: "Very High" },
        },
    },
    disclaimer: "This questionnaire is a screening tool and does not provide a definitive diagnosis. A clinical evaluation by a healthcare professional is necessary for a formal ADHD diagnosis.",
};
exports.default = ASRS_V1_1;
//# sourceMappingURL=adhd.js.map