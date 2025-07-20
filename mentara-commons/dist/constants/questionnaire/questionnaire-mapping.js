"use strict";
// Questionnaire mapping and utility functions
// This file provides a centralized mapping between questionnaire names and objects
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidQuestionnaireName = exports.getQuestionnaireById = exports.getAllQuestionnaireNames = exports.getQuestionnaireByName = exports.QUESTIONNAIRE_ID_TO_NAME_MAP = exports.QUESTIONNAIRE_MAP = exports.LIST_OF_QUESTIONNAIRES = void 0;
const adhd_1 = __importDefault(require("./adhd"));
const alcohol_1 = __importDefault(require("./alcohol"));
const binge_eating_1 = __importDefault(require("./binge-eating"));
const burnout_1 = __importDefault(require("./burnout"));
const gad_7_anxiety_1 = __importDefault(require("./gad-7-anxiety"));
const insomnia_1 = __importDefault(require("./insomnia"));
const mood_disorder_1 = __importDefault(require("./mood-disorder"));
const obsessional_compulsive_1 = __importDefault(require("./obsessional-compulsive"));
const panic_disorder_1 = __importDefault(require("./panic-disorder"));
const perceived_stress_scale_1 = __importDefault(require("./perceived-stress-scale"));
const phobia_1 = __importDefault(require("./phobia"));
const phq_9_1 = __importDefault(require("./phq-9"));
const ptsd_1 = __importDefault(require("./ptsd"));
const social_phobia_1 = __importDefault(require("./social-phobia"));
// List of questionnaire display names for UI components
exports.LIST_OF_QUESTIONNAIRES = [
    "Stress",
    "Anxiety",
    "Depression",
    "Insomnia",
    "Panic",
    "Bipolar disorder (BD)",
    "Obsessive compulsive disorder (OCD)",
    "Post-traumatic stress disorder (PTSD)",
    "Social anxiety",
    "Phobia",
    "Burnout",
    "Binge eating / Eating disorders",
    "ADD / ADHD",
    "Substance or Alcohol Use Issues",
];
// Mapping from display names to questionnaire objects
exports.QUESTIONNAIRE_MAP = {
    Stress: perceived_stress_scale_1.default,
    Anxiety: gad_7_anxiety_1.default,
    Depression: phq_9_1.default,
    Insomnia: insomnia_1.default,
    Panic: panic_disorder_1.default,
    "Bipolar disorder (BD)": mood_disorder_1.default,
    "Obsessive compulsive disorder (OCD)": obsessional_compulsive_1.default,
    "Post-traumatic stress disorder (PTSD)": ptsd_1.default,
    "Social anxiety": social_phobia_1.default,
    Phobia: phobia_1.default,
    Burnout: burnout_1.default,
    "Binge eating / Eating disorders": binge_eating_1.default,
    "ADD / ADHD": adhd_1.default,
    "Substance or Alcohol Use Issues": alcohol_1.default,
};
// Reverse mapping from questionnaire IDs to display names
exports.QUESTIONNAIRE_ID_TO_NAME_MAP = {
    adhd: "ADD / ADHD",
    alcohol: "Substance or Alcohol Use Issues",
    "binge-eating": "Binge eating / Eating disorders",
    burnout: "Burnout",
    "drug-abuse": "Substance or Alcohol Use Issues", // Note: shares with alcohol
    anxiety: "Anxiety",
    insomnia: "Insomnia",
    "mood-disorder": "Bipolar disorder (BD)",
    "obsessional-compulsive": "Obsessive compulsive disorder (OCD)",
    "panic-disorder": "Panic",
    stress: "Stress",
    phobia: "Phobia",
    depression: "Depression",
    ptsd: "Post-traumatic stress disorder (PTSD)",
    "social-phobia": "Social anxiety",
};
// Helper function to get questionnaire by display name
const getQuestionnaireByName = (name) => {
    return exports.QUESTIONNAIRE_MAP[name];
};
exports.getQuestionnaireByName = getQuestionnaireByName;
// Helper function to get all questionnaire names
const getAllQuestionnaireNames = () => {
    return exports.LIST_OF_QUESTIONNAIRES;
};
exports.getAllQuestionnaireNames = getAllQuestionnaireNames;
// Helper function to get questionnaire by ID
const getQuestionnaireById = (id) => {
    const displayName = exports.QUESTIONNAIRE_ID_TO_NAME_MAP[id];
    return displayName ? exports.QUESTIONNAIRE_MAP[displayName] : null;
};
exports.getQuestionnaireById = getQuestionnaireById;
// Helper function to validate if a questionnaire name exists
const isValidQuestionnaireName = (name) => {
    return exports.LIST_OF_QUESTIONNAIRES.includes(name);
};
exports.isValidQuestionnaireName = isValidQuestionnaireName;
//# sourceMappingURL=questionnaire-mapping.js.map