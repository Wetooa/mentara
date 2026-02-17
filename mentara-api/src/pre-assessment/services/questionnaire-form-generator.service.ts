import { Injectable, Logger } from '@nestjs/common';
import {
  QUESTIONNAIRES,
  QuestionnaireMetadata,
  Question,
  getQuestionnaireByName,
  getAllQuestionnaireNames,
} from '../../constants/questionnaires';

export interface QuestionnaireFormData {
  topic: string;
  shortName: string;
  description: string;
  questions: FormQuestion[];
  priority: number;
  startIndex: number;
  endIndex: number;
}

export interface FormQuestion {
  id: number;
  localId: number;
  text: string;
  type: string;
  options: Array<{ value: number; label: string }>;
  isReversed?: boolean;
}

@Injectable()
export class QuestionnaireFormGeneratorService {
  private readonly logger = new Logger(QuestionnaireFormGeneratorService.name);

  /**
   * Generate a questionnaire form for a specific topic
   */
  generateQuestionnaireForm(
    topic: string,
    priority: number = 5,
  ): QuestionnaireFormData | null {
    this.logger.debug(`Generating questionnaire form for topic: ${topic}`);

    const questionnaire = getQuestionnaireByName(topic);
    
    if (!questionnaire) {
      this.logger.warn(`No questionnaire found for topic: ${topic}`);
      return null;
    }

    return {
      topic: questionnaire.name,
      shortName: questionnaire.shortName,
      description: questionnaire.description,
      questions: this.formatQuestionsForFrontend(questionnaire.questions),
      priority,
      startIndex: questionnaire.startIndex,
      endIndex: questionnaire.endIndex,
    };
  }

  /**
   * Generate multiple questionnaire forms from a list of topics
   */
  generateMultipleForms(
    topics: Array<{ topic: string; priority: number }>,
  ): QuestionnaireFormData[] {
    const forms: QuestionnaireFormData[] = [];

    for (const { topic, priority } of topics) {
      const form = this.generateQuestionnaireForm(topic, priority);
      if (form) {
        forms.push(form);
      }
    }

    return forms;
  }

  /**
   * Format questions for frontend consumption
   */
  private formatQuestionsForFrontend(questions: Question[]): FormQuestion[] {
    return questions.map((q) => ({
      id: q.id,
      localId: q.localId,
      text: q.text,
      type: q.type,
      options: q.options,
      isReversed: q.isReversed,
    }));
  }

  /**
   * Get available questionnaire topics
   */
  getAvailableTopics(): string[] {
    return getAllQuestionnaireNames();
  }

  /**
   * Validate if a topic has an available questionnaire
   */
  hasQuestionnaire(topic: string): boolean {
    return getQuestionnaireByName(topic) !== undefined;
  }

  /**
   * Get questionnaire metadata without generating full form
   */
  getQuestionnaireMetadata(topic: string): Omit<QuestionnaireFormData, 'questions' | 'priority'> | null {
    const questionnaire = getQuestionnaireByName(topic);
    
    if (!questionnaire) {
      return null;
    }

    return {
      topic: questionnaire.name,
      shortName: questionnaire.shortName,
      description: questionnaire.description,
      startIndex: questionnaire.startIndex,
      endIndex: questionnaire.endIndex,
    };
  }

  /**
   * Convert questionnaire responses to flat answer array indices
   * Maps form responses to the correct positions in the 201-item array
   */
  mapResponsesToAnswerArray(
    topic: string,
    responses: Record<number, number>, // localId -> answer value
  ): Array<{ globalIndex: number; value: number }> {
    const questionnaire = getQuestionnaireByName(topic);
    
    if (!questionnaire) {
      this.logger.error(`Cannot map responses for unknown topic: ${topic}`);
      return [];
    }

    const mappedAnswers: Array<{ globalIndex: number; value: number }> = [];

    for (const [localIdStr, value] of Object.entries(responses)) {
      const localId = parseInt(localIdStr, 10);
      const question = questionnaire.questions.find(q => q.localId === localId);
      
      if (question) {
        mappedAnswers.push({
          globalIndex: question.id,
          value,
        });
      } else {
        this.logger.warn(`Question with localId ${localId} not found in ${topic}`);
      }
    }

    return mappedAnswers;
  }

  /**
   * Validate questionnaire responses
   */
  validateResponses(
    topic: string,
    responses: Record<number, number>,
  ): { isValid: boolean; errors: string[] } {
    const questionnaire = getQuestionnaireByName(topic);
    
    if (!questionnaire) {
      return {
        isValid: false,
        errors: [`Unknown questionnaire topic: ${topic}`],
      };
    }

    const errors: string[] = [];

    // Check if all questions are answered
    const answeredQuestions = Object.keys(responses).map(k => parseInt(k, 10));
    const allQuestions = questionnaire.questions.map(q => q.localId);
    
    for (const questionId of allQuestions) {
      if (!answeredQuestions.includes(questionId)) {
        errors.push(`Missing answer for question ${questionId}`);
      }
    }

    // Validate answer values are within valid range
    for (const [localIdStr, value] of Object.entries(responses)) {
      const localId = parseInt(localIdStr, 10);
      const question = questionnaire.questions.find(q => q.localId === localId);
      
      if (question) {
        const validValues = question.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          errors.push(
            `Invalid value ${value} for question ${localId}. Valid values: ${validValues.join(', ')}`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get question count for a specific topic
   */
  getQuestionCount(topic: string): number {
    const questionnaire = getQuestionnaireByName(topic);
    return questionnaire ? questionnaire.itemCount : 0;
  }
}

