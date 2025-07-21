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
exports.z = exports.UserProfileResponseSchema = exports.PaginatedResponseSchema = exports.PaginationMetaSchema = exports.ApiResponseSchema = exports.SuccessMessageResponseSchema = exports.UserResponseSchema = exports.UserIdParamSchema = exports.UserDeactivationResponseDtoSchema = exports.DeactivateUserDtoSchema = exports.UpdateClientDtoSchema = exports.RegisterClientDtoSchema = exports.RolePermissionsSchema = exports.FirstSignInResponseSchema = exports.UpdateUserRequestSchema = exports.CreateUserRequestSchema = exports.UserSchema = exports.UserRoleSchema = void 0;
__exportStar(require("./messaging"), exports);
__exportStar(require("./analytics"), exports);
__exportStar(require("./billing"), exports);
__exportStar(require("./communities"), exports);
__exportStar(require("./notifications"), exports);
__exportStar(require("./onboarding"), exports);
__exportStar(require("./worksheets"), exports);
__exportStar(require("./pre-assessment"), exports);
__exportStar(require("./client"), exports);
__exportStar(require("./comments"), exports);
__exportStar(require("./posts"), exports);
__exportStar(require("./admin"), exports);
__exportStar(require("./moderator"), exports);
__exportStar(require("./therapist"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./auth"), exports);
__exportStar(require("./booking"), exports);
__exportStar(require("./review"), exports);
__exportStar(require("./dashboard"), exports);
__exportStar(require("./meetings"), exports);
// User schemas (selective exports to avoid conflicts with auth)
var user_1 = require("./user");
Object.defineProperty(exports, "UserRoleSchema", { enumerable: true, get: function () { return user_1.UserRoleSchema; } });
Object.defineProperty(exports, "UserSchema", { enumerable: true, get: function () { return user_1.UserSchema; } });
Object.defineProperty(exports, "CreateUserRequestSchema", { enumerable: true, get: function () { return user_1.CreateUserRequestSchema; } });
Object.defineProperty(exports, "UpdateUserRequestSchema", { enumerable: true, get: function () { return user_1.UpdateUserRequestSchema; } });
Object.defineProperty(exports, "FirstSignInResponseSchema", { enumerable: true, get: function () { return user_1.FirstSignInResponseSchema; } });
Object.defineProperty(exports, "RolePermissionsSchema", { enumerable: true, get: function () { return user_1.RolePermissionsSchema; } });
Object.defineProperty(exports, "RegisterClientDtoSchema", { enumerable: true, get: function () { return user_1.RegisterClientDtoSchema; } });
Object.defineProperty(exports, "UpdateClientDtoSchema", { enumerable: true, get: function () { return user_1.UpdateClientDtoSchema; } });
Object.defineProperty(exports, "DeactivateUserDtoSchema", { enumerable: true, get: function () { return user_1.DeactivateUserDtoSchema; } });
Object.defineProperty(exports, "UserDeactivationResponseDtoSchema", { enumerable: true, get: function () { return user_1.UserDeactivationResponseDtoSchema; } });
Object.defineProperty(exports, "UserIdParamSchema", { enumerable: true, get: function () { return user_1.UserIdParamSchema; } });
Object.defineProperty(exports, "UserResponseSchema", { enumerable: true, get: function () { return user_1.UserResponseSchema; } });
Object.defineProperty(exports, "SuccessMessageResponseSchema", { enumerable: true, get: function () { return user_1.SuccessMessageResponseSchema; } });
Object.defineProperty(exports, "ApiResponseSchema", { enumerable: true, get: function () { return user_1.ApiResponseSchema; } });
Object.defineProperty(exports, "PaginationMetaSchema", { enumerable: true, get: function () { return user_1.PaginationMetaSchema; } });
Object.defineProperty(exports, "PaginatedResponseSchema", { enumerable: true, get: function () { return user_1.PaginatedResponseSchema; } });
Object.defineProperty(exports, "UserProfileResponseSchema", { enumerable: true, get: function () { return user_1.UserProfileResponseSchema; } });
// Re-export zod for convenience
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
//# sourceMappingURL=index.js.map