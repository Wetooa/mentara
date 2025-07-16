"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = void 0;
// Schema exports - Basic modules without conflicts
__exportStar(require("./user"), exports);
__exportStar(require("./review"), exports);
__exportStar(require("./messaging"), exports);
__exportStar(require("./analytics"), exports);
__exportStar(require("./audit-logs"), exports);
__exportStar(require("./billing"), exports);
__exportStar(require("./client-therapist-requests"), exports);
__exportStar(require("./communities"), exports);
__exportStar(require("./files"), exports);
__exportStar(require("./notifications"), exports);
__exportStar(require("./onboarding"), exports);
__exportStar(require("./sessions"), exports);
__exportStar(require("./worksheets"), exports);
__exportStar(require("./pre-assessment"), exports);
__exportStar(require("./push-notifications"), exports);
__exportStar(require("./client"), exports);
// Export schemas that have name conflicts
__exportStar(require("./comments"), exports);
__exportStar(require("./posts"), exports);
__exportStar(require("./booking"), exports);
__exportStar(require("./meetings"), exports);
__exportStar(require("./admin"), exports);
__exportStar(require("./moderator"), exports);
__exportStar(require("./therapist"), exports);
__exportStar(require("./search"), exports);
// Re-export zod for convenience
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
//# sourceMappingURL=index.js.map