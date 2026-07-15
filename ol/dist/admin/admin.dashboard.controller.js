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
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const http_response_1 = require("../utils/http-response");
const getDashboardStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [usersCount, adminsCount] = yield Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.user.count({ where: { role: "admin" } }),
        ]);
        return (0, http_response_1.successResponse)(res, {
            stats: {
                users: usersCount,
                admins: adminsCount,
            },
        }, "Welcome to admin dashboard");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to load dashboard stats", 500, error.message);
    }
});
exports.getDashboardStats = getDashboardStats;
