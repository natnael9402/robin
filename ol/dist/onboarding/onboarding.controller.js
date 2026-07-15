"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetUserOnboarding = exports.getOnboarding = exports.submitOnboarding = void 0;
const http_response_1 = require("../utils/http-response");
const onboarding_service_1 = require("./onboarding.service");
const submitOnboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = BigInt(req.user.id);
        const onboarding = yield (0, onboarding_service_1.upsertOnboarding)(userId, req.body);
        return (0, http_response_1.successResponse)(res, { onboarding }, "Onboarding completed successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to save onboarding", 500, error.message);
    }
});
exports.submitOnboarding = submitOnboarding;
const getOnboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = BigInt(req.user.id);
        const onboarding = yield (0, onboarding_service_1.getUserOnboarding)(userId);
        return (0, http_response_1.successResponse)(res, { onboarding }, "Onboarding retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve onboarding", 500, error.message);
    }
});
exports.getOnboarding = getOnboarding;
const adminGetUserOnboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = BigInt(req.params.userId);
        const onboarding = yield (0, onboarding_service_1.getUserOnboarding)(userId);
        if (!onboarding) {
            return (0, http_response_1.errorResponse)(res, "Onboarding data not found", 404);
        }
        return (0, http_response_1.successResponse)(res, { onboarding }, "Onboarding retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve onboarding", 500, error.message);
    }
});
exports.adminGetUserOnboarding = adminGetUserOnboarding;
