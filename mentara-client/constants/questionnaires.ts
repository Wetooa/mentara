// Import questionnaire functionality from mentara-commons
// This replaces the individual questionnaire imports with the centralized commons package
import {
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_MAP,
  type ListOfQuestionnaires,
} from "mentara-commons";

// Re-export the commons functionality for backward compatibility
export { LIST_OF_QUESTIONNAIRES, QUESTIONNAIRE_MAP, type ListOfQuestionnaires };
