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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserByAdmin = exports.updateUserByAdmin = exports.upgradeProfileLevel = exports.resetWithdrawalPassword = exports.updateTradeStatus = exports.updateKycStatus = exports.getProfileById = exports.getProfiles = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const prisma_2 = require("../generated/prisma");
const DEFAULT_WITHDRAWAL_PASSWORD = "12345678";
const MAX_PROFILE_LEVEL = 3;
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
        return input.map((item) => toPlainObject(item));
    }
    if (typeof input === "object") {
        return Object.fromEntries(Object.entries(input).map(([key, value]) => [
            key,
            toPlainObject(value),
        ]));
    }
    return input;
};
const parseJsonField = (value) => {
    if (!value)
        return null;
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
            return parsed;
        }
        return null;
    }
    catch (error) {
        return null;
    }
};
const formatProfile = (profile) => {
    const plainProfile = toPlainObject(profile);
    delete plainProfile.withdrawal_password;
    delete plainProfile.google_auth_secret;
    plainProfile.kyc_documents = parseJsonField(profile.kyc_documents);
    plainProfile.blockchain_addresses = parseJsonField(profile.blockchain_addresses);
    plainProfile.notification_settings = parseJsonField(profile.notification_settings);
    if (profile.user) {
        const plainUser = toPlainObject(profile.user);
        delete plainUser.password;
        delete plainUser.remember_token;
        delete plainUser.fund_password;
        plainProfile.user = plainUser;
    }
    return plainProfile;
};
const buildProfileWhere = (filters) => {
    const where = {};
    if (filters.kyc_status) {
        where.kyc_status = filters.kyc_status;
    }
    if (filters.trade_status) {
        where.trade_status = filters.trade_status;
    }
    if (filters.search) {
        const term = filters.search.trim();
        if (term.length > 0) {
            where.OR = [
                { uuid: { contains: term } },
                { user: { is: { name: { contains: term } } } },
                { user: { is: { email: { contains: term } } } },
                { user: { is: { phone: { contains: term } } } },
            ];
        }
    }
    return where;
};
const getProfiles = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, perPage, kyc_status, trade_status, search } = params;
    const skip = (page - 1) * perPage;
    const where = buildProfileWhere({ kyc_status, trade_status, search });
    const [profiles, total] = yield Promise.all([
        prisma_1.default.profile.findMany({
            where,
            include: { user: true },
            skip,
            take: perPage,
            orderBy: { id: "desc" },
        }),
        prisma_1.default.profile.count({ where }),
    ]);
    return {
        profiles: profiles.map(formatProfile),
        pagination: {
            page,
            perPage,
            total,
            totalPages: Math.ceil(total / perPage) || 1,
        },
    };
});
exports.getProfiles = getProfiles;
const getProfileById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile.findUnique({
        where: { id: BigInt(id) },
        include: { user: true },
    });
    if (!profile) {
        return null;
    }
    return formatProfile(profile);
});
exports.getProfileById = getProfileById;
const updateKycStatus = (id, status, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile.findUnique({
        where: { id: BigInt(id) },
    });
    if (!profile) {
        throw new Error("Profile not found");
    }
    const kyc_documents = parseJsonField(profile.kyc_documents) || {};
    const timestamp = new Date().toISOString();
    if (status === "rejected") {
        kyc_documents.rejection_reason = reason;
        kyc_documents.reviewed_at = timestamp;
        delete kyc_documents.verified_at;
    }
    else if (status === "verified") {
        kyc_documents.verified_at = timestamp;
        delete kyc_documents.rejection_reason;
        delete kyc_documents.reviewed_at;
    }
    const updated = yield prisma_1.default.profile.update({
        where: { id: BigInt(id) },
        data: {
            kyc_status: status,
            kyc_documents: JSON.stringify(kyc_documents),
        },
        include: { user: true },
    });
    return formatProfile(updated);
});
exports.updateKycStatus = updateKycStatus;
const updateTradeStatus = (id, tradeStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile
        .update({
        where: { id: BigInt(id) },
        data: { trade_status: tradeStatus },
        include: { user: true },
    })
        .catch(() => null);
    if (!profile) {
        throw new Error("Profile not found");
    }
    return formatProfile(profile);
});
exports.updateTradeStatus = updateTradeStatus;
const resetWithdrawalPassword = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile.findUnique({
        where: { id: BigInt(id) },
    });
    if (!profile) {
        throw new Error("Profile not found");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(DEFAULT_WITHDRAWAL_PASSWORD, 10);
    yield prisma_1.default.profile.update({
        where: { id: BigInt(id) },
        data: {
            withdrawal_password: hashedPassword,
            withdrawal_password_enabled: true,
        },
    });
    return {
        message: `Withdrawal password reset to default (${DEFAULT_WITHDRAWAL_PASSWORD})`,
    };
});
exports.resetWithdrawalPassword = resetWithdrawalPassword;
const upgradeProfileLevel = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile.findUnique({
        where: { id: BigInt(id) },
        include: { user: true },
    });
    if (!profile) {
        throw new Error("Profile not found");
    }
    if (profile.level >= MAX_PROFILE_LEVEL) {
        throw new Error("User is already at maximum level");
    }
    const updated = yield prisma_1.default.profile.update({
        where: { id: BigInt(id) },
        data: { level: profile.level + 1 },
        include: { user: true },
    });
    return formatProfile(updated);
});
exports.upgradeProfileLevel = upgradeProfileLevel;
const setProfileLevel = (id, level) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.profile.findUnique({
        where: { id: BigInt(id) },
        include: { user: true },
    });
    if (!profile) {
        throw new Error("Profile not found");
    }
    if (level < 1 || level > MAX_PROFILE_LEVEL) {
        throw new Error(`Level must be between 1 and ${MAX_PROFILE_LEVEL}`);
    }
    const updated = yield prisma_1.default.profile.update({
        where: { id: BigInt(id) },
        data: { level },
        include: { user: true },
    });
    return formatProfile(updated);
});
exports.setProfileLevel = setProfileLevel;
const updateUserByAdmin = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id: BigInt(id) },
    });
    if (!existingUser) {
        throw new Error("User not found");
    }
    if (existingUser.email !== null &&
        existingUser.email.includes("superadmin")) {
        const forbidden = new Error("Modifications to superadmin email are not allowed");
        forbidden.statusCode = 403;
        throw forbidden;
    }
    if (data.email) {
        const emailInUse = yield prisma_1.default.user.findFirst({
            where: {
                email: data.email,
                NOT: { id: BigInt(id) },
            },
        });
        if (emailInUse) {
            const conflict = new Error("Email already in use");
            conflict.statusCode = 409;
            throw conflict;
        }
    }
    if (data.phone) {
        const phoneInUse = yield prisma_1.default.user.findFirst({
            where: {
                phone: data.phone,
                NOT: { id: BigInt(id) },
            },
        });
        if (phoneInUse) {
            const conflict = new Error("Phone already in use");
            conflict.statusCode = 409;
            throw conflict;
        }
    }
    const updateData = {};
    if (typeof data.name !== "undefined") {
        updateData.name = data.name;
    }
    if (typeof data.email !== "undefined") {
        updateData.email = data.email;
    }
    if (typeof data.phone !== "undefined") {
        updateData.phone = data.phone;
    }
    if (typeof data.balance !== "undefined") {
        updateData.balance = new prisma_2.Prisma.Decimal(data.balance);
    }
    if (typeof data.status !== "undefined") {
        updateData.status = data.status;
    }
    if (data.password) {
        updateData.password = yield bcryptjs_1.default.hash(data.password, 10);
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: { profiles: true },
    });
    const { password } = updatedUser, safeUser = __rest(updatedUser, ["password"]);
    return safeUser;
});
exports.updateUserByAdmin = updateUserByAdmin;
const deleteUserByAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: BigInt(id) },
    });
    if (!user) {
        const notFound = new Error("User not found");
        notFound.statusCode = 404;
        throw notFound;
    }
    if (user.email && user.email.includes("superadmin")) {
        const forbidden = new Error("Deletion of superadmin account is not allowed");
        forbidden.statusCode = 403;
        throw forbidden;
    }
    yield prisma_1.default.user.delete({
        where: { id: BigInt(id) },
    });
});
exports.deleteUserByAdmin = deleteUserByAdmin;
