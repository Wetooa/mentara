"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTIONNAIRE_SCORING = void 0;
exports.QUESTIONNAIRE_SCORING = {
    scoreMapping: {},
    severityLevels: {},
    getScore: function (answers) {
        return answers.reduce((total, answer) => total + (this.scoreMapping[answer] || 0), 0);
    },
    getSeverity: function (score) {
        for (const level in this.severityLevels) {
            const severityLevel = this.severityLevels[level];
            if (severityLevel && score >= severityLevel.range[0] && score <= severityLevel.range[1]) {
                return severityLevel.label;
            }
        }
        return "Invalid score";
    },
};
//# sourceMappingURL=scoring.js.map