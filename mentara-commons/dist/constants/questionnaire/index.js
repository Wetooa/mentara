"use strict";
// Mental Health Questionnaire Constants
// Centralized source of truth for all mental health assessment questionnaires
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMUNITY_RECOMMENDATION_THRESHOLDS = exports.QUESTIONNAIRE_TO_COMMUNITY_MAP = exports.isValidQuestionnaireName = exports.getQuestionnaireById = exports.getAllQuestionnaireNames = exports.getQuestionnaireByName = exports.QUESTIONNAIRE_ID_TO_NAME_MAP = exports.QUESTIONNAIRE_MAPPING = exports.LIST_OF_QUESTIONNAIRES = exports.SOCIAL_PHOBIA_SPIN = exports.PTSD_PCL5 = exports.DEPRESSION_PHQ9 = exports.PHOBIA_SPECIFIC = exports.STRESS_PSS = exports.PANIC_DISORDER_PDSS = exports.OCD_OCI_R = exports.MOOD_DISORDER_MDQ = exports.INSOMNIA_ISI = exports.ANXIETY_GAD7 = exports.DRUG_ABUSE_DAST = exports.BURNOUT_MBI = exports.BINGE_EATING_BES = exports.ALCOHOL_AUDIT = exports.ADHD_ASRS = void 0;
var adhd_1 = require("./adhd");
Object.defineProperty(exports, "ADHD_ASRS", { enumerable: true, get: function () { return __importDefault(adhd_1).default; } });
var alcohol_1 = require("./alcohol");
Object.defineProperty(exports, "ALCOHOL_AUDIT", { enumerable: true, get: function () { return __importDefault(alcohol_1).default; } });
var binge_eating_1 = require("./binge-eating");
Object.defineProperty(exports, "BINGE_EATING_BES", { enumerable: true, get: function () { return __importDefault(binge_eating_1).default; } });
var burnout_1 = require("./burnout");
Object.defineProperty(exports, "BURNOUT_MBI", { enumerable: true, get: function () { return __importDefault(burnout_1).default; } });
var drug_abuse_1 = require("./drug-abuse");
Object.defineProperty(exports, "DRUG_ABUSE_DAST", { enumerable: true, get: function () { return __importDefault(drug_abuse_1).default; } });
var gad_7_anxiety_1 = require("./gad-7-anxiety");
Object.defineProperty(exports, "ANXIETY_GAD7", { enumerable: true, get: function () { return __importDefault(gad_7_anxiety_1).default; } });
var insomnia_1 = require("./insomnia");
Object.defineProperty(exports, "INSOMNIA_ISI", { enumerable: true, get: function () { return __importDefault(insomnia_1).default; } });
var mood_disorder_1 = require("./mood-disorder");
Object.defineProperty(exports, "MOOD_DISORDER_MDQ", { enumerable: true, get: function () { return __importDefault(mood_disorder_1).default; } });
var obsessional_compulsive_1 = require("./obsessional-compulsive");
Object.defineProperty(exports, "OCD_OCI_R", { enumerable: true, get: function () { return __importDefault(obsessional_compulsive_1).default; } });
var panic_disorder_1 = require("./panic-disorder");
Object.defineProperty(exports, "PANIC_DISORDER_PDSS", { enumerable: true, get: function () { return __importDefault(panic_disorder_1).default; } });
var perceived_stress_scale_1 = require("./perceived-stress-scale");
Object.defineProperty(exports, "STRESS_PSS", { enumerable: true, get: function () { return __importDefault(perceived_stress_scale_1).default; } });
var phobia_1 = require("./phobia");
Object.defineProperty(exports, "PHOBIA_SPECIFIC", { enumerable: true, get: function () { return __importDefault(phobia_1).default; } });
var phq_9_1 = require("./phq-9");
Object.defineProperty(exports, "DEPRESSION_PHQ9", { enumerable: true, get: function () { return __importDefault(phq_9_1).default; } });
var ptsd_1 = require("./ptsd");
Object.defineProperty(exports, "PTSD_PCL5", { enumerable: true, get: function () { return __importDefault(ptsd_1).default; } });
var social_phobia_1 = require("./social-phobia");
Object.defineProperty(exports, "SOCIAL_PHOBIA_SPIN", { enumerable: true, get: function () { return __importDefault(social_phobia_1).default; } });
// Questionnaire mapping and utilities
var questionnaire_mapping_1 = require("./questionnaire-mapping");
Object.defineProperty(exports, "LIST_OF_QUESTIONNAIRES", { enumerable: true, get: function () { return questionnaire_mapping_1.LIST_OF_QUESTIONNAIRES; } });
Object.defineProperty(exports, "QUESTIONNAIRE_MAPPING", { enumerable: true, get: function () { return questionnaire_mapping_1.QUESTIONNAIRE_MAP; } });
Object.defineProperty(exports, "QUESTIONNAIRE_ID_TO_NAME_MAP", { enumerable: true, get: function () { return questionnaire_mapping_1.QUESTIONNAIRE_ID_TO_NAME_MAP; } });
Object.defineProperty(exports, "getQuestionnaireByName", { enumerable: true, get: function () { return questionnaire_mapping_1.getQuestionnaireByName; } });
Object.defineProperty(exports, "getAllQuestionnaireNames", { enumerable: true, get: function () { return questionnaire_mapping_1.getAllQuestionnaireNames; } });
Object.defineProperty(exports, "getQuestionnaireById", { enumerable: true, get: function () { return questionnaire_mapping_1.getQuestionnaireById; } });
Object.defineProperty(exports, "isValidQuestionnaireName", { enumerable: true, get: function () { return questionnaire_mapping_1.isValidQuestionnaireName; } });
// Community mapping based on questionnaire results
exports.QUESTIONNAIRE_TO_COMMUNITY_MAP = {
    'adhd': 'ADHD Support',
    'alcohol': 'Substance Use Recovery',
    'binge-eating': 'Eating Disorder Recovery',
    'burnout': 'Burnout & Stress Management',
    'drug-abuse': 'Substance Use Recovery',
    'anxiety': 'Anxiety Support',
    'insomnia': 'Sleep Disorders',
    'mood-disorder': 'Mood Disorders',
    'obsessional-compulsive': 'OCD Support',
    'panic-disorder': 'Panic & Anxiety',
    'stress': 'Stress Management',
    'phobia': 'Phobia Support',
    'depression': 'Depression Support',
    'ptsd': 'PTSD & Trauma Recovery',
    'social-phobia': 'Social Anxiety Support'
};
// Severity level thresholds for community recommendations
exports.COMMUNITY_RECOMMENDATION_THRESHOLDS = {
    LOW: 0.3,
    MODERATE: 0.6,
    HIGH: 0.8
};
//# sourceMappingURL=index.js.map