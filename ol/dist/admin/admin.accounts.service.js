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
exports.deleteAdminAccount = exports.updateAdminAccount = exports.createAdminAccount = exports.listAdminAccounts = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const prisma_2 = require("../generated/prisma");
const ADMIN_SELECT = {
    id: true,
    name: true,
    email: true,
    status: true,
    role: true,
    created_at: true,
    updated_at: true,
};
const formatTimestamp = (value) => value instanceof Date ? value.toISOString() : null;
const formatAdmin = (admin) => ({
    id: Number(admin.id),
    name: admin.name,
    email: admin.email,
    status: admin.status,
    role: admin.role,
    created_at: formatTimestamp(admin.created_at),
    updated_at: formatTimestamp(admin.updated_at),
});
const isProtectedAdmin = (email) => typeof email === "string" && email.includes("superadmin");
const buildSearchFilter = (search) => {
    if (!search) {
        return undefined;
    }
    const term = search.trim();
    if (term.length === 0) {
        return undefined;
    }
    return [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
    ];
};
const findAdminById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield prisma_1.default.user.findUnique({
        where: { id: BigInt(id) },
        select: ADMIN_SELECT,
    });
    if (!record || record.role !== prisma_2.UserRole.admin) {
        return null;
    }
    return record;
});
const ensureEmailAvailable = (email, excludeId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.user.findFirst({
        where: Object.assign({ email }, (excludeId ? { NOT: { id: excludeId } } : {})),
    });
    if (existing) {
        const error = new Error("Email already in use");
        error.code = "EMAIL_IN_USE";
        throw error;
    }
});
const listAdminAccounts = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, perPage, search } = params;
    const skip = Math.max(page - 1, 0) * perPage;
    const where = {
        role: prisma_2.UserRole.admin,
    };
    const orFilters = buildSearchFilter(search);
    if (orFilters) {
        where.OR = orFilters;
    }
    const [records, total] = yield Promise.all([
        prisma_1.default.user.findMany({
            where,
            select: ADMIN_SELECT,
            skip,
            take: perPage,
            orderBy: { created_at: "desc" },
        }),
        prisma_1.default.user.count({ where }),
    ]);
    return {
        admins: records.map(formatAdmin),
        pagination: {
            page,
            perPage,
            total,
        },
    };
});
exports.listAdminAccounts = listAdminAccounts;
const createAdminAccount = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield ensureEmailAvailable(input.email);
    const hashedPassword = yield bcryptjs_1.default.hash(input.password, 10);
    const admin = yield prisma_1.default.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: prisma_2.UserRole.admin,
            status: (_a = input.status) !== null && _a !== void 0 ? _a : prisma_2.UserStatus.active,
        },
        select: ADMIN_SELECT,
    });
    return formatAdmin(admin);
});
exports.createAdminAccount = createAdminAccount;
const updateAdminAccount = (id, data, authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield findAdminById(id);
    if (!admin) {
        const error = new Error("Admin not found");
        error.code = "NOT_FOUND";
        throw error;
    }
    if (isProtectedAdmin(admin.email) && admin.email !== authUser.email) {
        const error = new Error("Modifications to superadmin email are not allowed");
        error.code = "FORBIDDEN";
        throw error;
    }
    if (data.email && data.email !== admin.email) {
        yield ensureEmailAvailable(data.email, BigInt(id));
    }
    const updateData = {};
    if (typeof data.name !== "undefined") {
        updateData.name = data.name;
    }
    if (typeof data.email !== "undefined") {
        updateData.email = data.email;
    }
    if (typeof data.status !== "undefined") {
        updateData.status = data.status;
    }
    if (data.password) {
        updateData.password = yield bcryptjs_1.default.hash(data.password, 10);
    }
    const updated = yield prisma_1.default.user.update({
        where: { id: BigInt(id) },
        data: updateData,
        select: ADMIN_SELECT,
    });
    return formatAdmin(updated);
});
exports.updateAdminAccount = updateAdminAccount;
const deleteAdminAccount = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield prisma_1.default.user.findUnique({
        where: { id: BigInt(id) },
    });
    if (!admin || admin.role !== prisma_2.UserRole.admin) {
        const error = new Error("Admin not found");
        error.code = "NOT_FOUND";
        throw error;
    }
    if (isProtectedAdmin(admin.email)) {
        const error = new Error("Deletion of superadmin account is not permitted");
        error.code = "FORBIDDEN";
        throw error;
    }
    yield prisma_1.default.user.delete({
        where: { id: BigInt(id) },
    });
});
exports.deleteAdminAccount = deleteAdminAccount;
