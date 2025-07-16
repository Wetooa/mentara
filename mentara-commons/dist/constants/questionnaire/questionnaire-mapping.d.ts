import { QuestionnaireProps } from '../scoring';
export declare const LIST_OF_QUESTIONNAIRES: readonly ["Stress", "Anxiety", "Depression", "Insomnia", "Panic", "Bipolar disorder (BD)", "Obsessive compulsive disorder (OCD)", "Post-traumatic stress disorder (PTSD)", "Social anxiety", "Phobia", "Burnout", "Binge eating / Eating disorders", "ADD / ADHD", "Substance or Alcohol Use Issues"];
export type ListOfQuestionnaires = (typeof LIST_OF_QUESTIONNAIRES)[number];
export declare const QUESTIONNAIRE_MAP: Record<ListOfQuestionnaires, QuestionnaireProps>;
export declare const QUESTIONNAIRE_ID_TO_NAME_MAP: Record<string, ListOfQuestionnaires>;
export declare const getQuestionnaireByName: (name: ListOfQuestionnaires) => QuestionnaireProps;
export declare const getAllQuestionnaireNames: () => readonly ListOfQuestionnaires[];
export declare const getQuestionnaireById: (id: string) => QuestionnaireProps | null;
export declare const isValidQuestionnaireName: (name: string) => name is ListOfQuestionnaires;
//# sourceMappingURL=questionnaire-mapping.d.ts.map