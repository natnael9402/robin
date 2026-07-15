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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubmission = exports.updateSubmissionStatus = exports.createSubmission = exports.getSubmissionById = exports.listSubmissions = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const prisma_2 = require("../generated/prisma");
const toPlainObject = (input) => {
    if (input === null || input === undefined) {
        return input;
    }
    if (typeof input === "bigint") {
        return Number(input);
    }
    if (input instanceof prisma_2.Prisma.Decimal) {
        return input.toString();
    }
    if (input instanceof Date) {
        return input.toISOString();
    }
    if (Array.isArray(input)) {
        return input.map((value) => toPlainObject(value));
    }
    if (typeof input === "object") {
        const entries = Object.entries(input).map(([key, value]) => [key, toPlainObject(value)]);
        return Object.fromEntries(entries);
    }
    return input;
};
const sanitizeUser = (user) => {
    const sanitized = Object.assign({}, user);
    delete sanitized.password;
    delete sanitized.remember_token;
    delete sanitized.fund_password;
    return sanitized;
};
const formatSubmission = (submission, options) => {
    const plain = toPlainObject(submission);
    if (!options.includeRelations) {
        delete plain.user;
        delete plain.processor;
    }
    else {
        if (submission.user) {
            plain.user = sanitizeUser(toPlainObject(submission.user));
        }
        if (submission.processor) {
            plain.processor = sanitizeUser(toPlainObject(submission.processor));
        }
    }
    return plain;
};
const listSubmissions = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, isAdmin, status, page, perPage } = params;
    const skip = (page - 1) * perPage;
    const where = {};
    if (!isAdmin) {
        where.user_id = userId;
    }
    if (status && ["pending", "approved", "rejected"].includes(status)) {
        where.status = status;
    }
    const include = isAdmin
        ? { user: true, processor: true }
        : undefined;
    const [records, total] = yield Promise.all([
        prisma_1.default.kycSubmission.findMany({
            where,
            include,
            skip,
            take: perPage,
            orderBy: { created_at: "desc" },
        }),
        prisma_1.default.kycSubmission.count({ where }),
    ]);
    return {
        submissions: records.map((record) => formatSubmission(record, {
            includeRelations: isAdmin,
        })),
        pagination: {
            page,
            perPage,
            total,
        },
    };
});
exports.listSubmissions = listSubmissions;
const getSubmissionById = (id, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield prisma_1.default.kycSubmission.findUnique({
        where: { id: BigInt(id) },
        include: { user: true, processor: true },
    });
    if (!submission) {
        return null;
    }
    if (!isAdmin && submission.user_id !== userId) {
        return null;
    }
    return formatSubmission(submission, {
        includeRelations: isAdmin,
    });
});
exports.getSubmissionById = getSubmissionById;
const createSubmission = (userId, input) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSubmission = yield prisma_1.default.kycSubmission.findFirst({
        where: {
            user_id: userId,
            status: { in: ["pending", "approved"] },
        },
    });
    if (existingSubmission) {
        const error = new Error(existingSubmission.status === "approved"
            ? "You already have an approved KYC submission"
            : "You already have a pending KYC submission");
        error.code = "KYC_EXISTS";
        throw error;
    }
    const submission = yield prisma_1.default.kycSubmission.create({
        data: {
            user_id: userId,
            document_type: input.document_type,
            document_number: input.document_number,
            front_image_url: input.front_image_url,
            back_image_url: input.back_image_url,
            selfie_image_url: input.selfie_image_url,
            status: prisma_2.KycSubmissionStatus.pending,
        },
    });
    yield prisma_1.default.profile.updateMany({
        where: { user_id: userId },
        data: { kyc_status: prisma_2.ProfileKycStatus.pending },
    });
    return formatSubmission(submission, {
        includeRelations: false,
    });
});
exports.createSubmission = createSubmission;
const updateSubmissionStatus = (id, input) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield prisma_1.default.kycSubmission.findUnique({
        where: { id: BigInt(id) },
        include: { user: { include: { profiles: true } } },
    });
    if (!submission) {
        const error = new Error("KYC submission not found");
        error.code = "NOT_FOUND";
        throw error;
    }
    if (submission.status !== prisma_2.KycSubmissionStatus.pending) {
        const error = new Error("This KYC submission has already been processed");
        error.code = "ALREADY_PROCESSED";
        throw error;
    }
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const now = new Date();
        const updated = yield tx.kycSubmission.update({
            where: { id: BigInt(id) },
            data: {
                status: input.status,
                processed_by: input.processorId,
                processed_at: now,
                approved_at: input.status === "approved" ? now : null,
                rejected_at: input.status === "approved" ? null : now,
                rejection_reason: input.status === "approved" ? null : (_a = input.rejection_reason) !== null && _a !== void 0 ? _a : null,
            },
            include: { user: true, processor: true },
        });
        const profile = (_c = (_b = submission.user) === null || _b === void 0 ? void 0 : _b.profiles) === null || _c === void 0 ? void 0 : _c[0];
        if (profile) {
            yield tx.profile.update({
                where: { id: profile.id },
                data: {
                    kyc_status: input.status === "approved"
                        ? prisma_2.ProfileKycStatus.verified
                        : prisma_2.ProfileKycStatus.rejected,
                },
            });
        }
        return formatSubmission(updated, {
            includeRelations: true,
        });
    }));
});
exports.updateSubmissionStatus = updateSubmissionStatus;
const deleteSubmission = (id, userId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield prisma_1.default.kycSubmission.findUnique({ where: { id: BigInt(id) } });
    if (!submission) {
        const error = new Error("KYC submission not found or cannot be deleted");
        error.code = "NOT_FOUND";
        throw error;
    }
    if (!isAdmin) {
        if (submission.user_id !== userId || submission.status !== "pending") {
            const error = new Error("KYC submission not found or cannot be deleted");
            error.code = "FORBIDDEN";
            throw error;
        }
    }
    yield prisma_1.default.kycSubmission.delete({ where: { id: BigInt(id) } });
});
exports.deleteSubmission = deleteSubmission;
