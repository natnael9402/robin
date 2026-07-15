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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.cancelHosting = exports.updateHostingStatus = exports.processHostingProfits = exports.deleteHosting = exports.updateHosting = exports.createHosting = exports.getHosting = exports.getAdminHostings = exports.getHostings = void 0;
const hostingService = __importStar(require("./mining-hosting.service"));
const prisma_1 = __importDefault(require("../prisma"));
const mining_hosting_scheduler_1 = __importDefault(require("./jobs/mining-hosting.scheduler"));
const logger_1 = require("../utils/logger");
const getHostings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostings = yield hostingService.getHostings(req.user.id);
        res.json({
            success: true,
            message: "Mining hostings retrieved successfully",
            data: hostings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve hostings",
            error: error.message,
        });
    }
});
exports.getHostings = getHostings;
const getAdminHostings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId } = req.query;
        const hostings = yield hostingService.getAdminHostings(status, userId ? Number(userId) : undefined);
        res.json({
            success: true,
            message: "All mining hostings retrieved successfully",
            data: hostings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve hostings",
            error: error.message,
        });
    }
});
exports.getAdminHostings = getAdminHostings;
const getHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const hosting = yield hostingService.getHostingById(id, req.user.id, req.user.role === "admin");
        if (hosting) {
            res.json({
                success: true,
                message: "Mining hosting retrieved successfully",
                data: hosting,
            });
        }
        else {
            res
                .status(404)
                .json({ success: false, message: "Mining hosting not found" });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve hosting",
            error: error.message,
        });
    }
});
exports.getHosting = getHosting;
const createHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { product_id, amount, currency } = req.body;
        const result = yield hostingService.createHosting(req.user.id, product_id, amount, currency);
        try {
            mining_hosting_scheduler_1.default.scheduleCompletion(BigInt(result.hosting.id), result.hosting.end_date);
        }
        catch (schedulerError) {
            logger_1.logger.error("Failed to schedule mining hosting completion", {
                userId: req.user.id,
                product_id,
                hostingId: (_a = result.hosting) === null || _a === void 0 ? void 0 : _a.id,
                error: schedulerError instanceof Error
                    ? schedulerError.message
                    : schedulerError,
            });
        }
        res.status(201).json({
            success: true,
            message: "Mining hosting created successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create hosting",
            error: error.message,
        });
    }
});
exports.createHosting = createHosting;
const updateHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const hostingId = parseInt(req.params.id);
        const { status } = req.body;
        if (req.user.role !== "admin" && status === "cancelled") {
            const result = yield hostingService.cancelHosting(hostingId, req.user.id);
            try {
                mining_hosting_scheduler_1.default.cancel(BigInt(result.hosting.id));
            }
            catch (schedulerError) {
                logger_1.logger.error("Failed to cancel mining hosting completion job", {
                    hostingId: (_a = result.hosting) === null || _a === void 0 ? void 0 : _a.id,
                    error: schedulerError instanceof Error
                        ? schedulerError.message
                        : schedulerError,
                });
            }
            return res.json({
                success: true,
                message: "Mining hosting cancelled successfully",
                data: result,
            });
        }
        if (req.user.role === "admin") {
            // Admin can do more things here if needed in future
            return res.status(403).json({
                success: false,
                message: "Admin updates for hosting not fully implemented here, use specific endpoints.",
            });
        }
        res
            .status(403)
            .json({ success: false, message: "Unauthorized or invalid action" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update hosting",
            error: error.message,
        });
    }
});
exports.updateHosting = updateHosting;
const deleteHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const hostingId = parseInt(req.params.id);
        yield hostingService.deleteHostingAsAdmin(hostingId);
        try {
            mining_hosting_scheduler_1.default.cancel(BigInt(hostingId));
        }
        catch (schedulerError) {
            logger_1.logger.error("Failed to cancel mining hosting completion job", {
                hostingId,
                error: schedulerError instanceof Error
                    ? schedulerError.message
                    : schedulerError,
            });
        }
        res.json({ success: true, message: "Mining hosting deleted successfully" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete hosting",
            error: error.message,
        });
    }
});
exports.deleteHosting = deleteHosting;
const processHostingProfits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const hostingId = parseInt(req.params.id);
        const hosting = yield prisma_1.default.miningHosting.findUnique({
            where: { id: hostingId },
            include: { product: true },
        });
        if (!hosting) {
            return res
                .status(404)
                .json({ success: false, message: "Hosting not found" });
        }
        yield hostingService.processPendingProfits(hosting, prisma_1.default);
        res.json({ success: true, message: "Profits processed successfully" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to process profits",
            error: error.message,
        });
    }
});
exports.processHostingProfits = processHostingProfits;
const updateHostingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const hostingId = parseInt(req.params.id);
        const { status } = req.body;
        const result = yield hostingService.updateHostingStatusAsAdmin(hostingId, status);
        res.json({
            success: true,
            message: "Hosting status updated",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
});
exports.updateHostingStatus = updateHostingStatus;
const cancelHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const hostingId = parseInt(req.params.id);
        const result = yield hostingService.cancelHosting(hostingId, req.user.id);
        try {
            mining_hosting_scheduler_1.default.cancel(BigInt(result.hosting.id));
        }
        catch (schedulerError) {
            logger_1.logger.error("Failed to cancel mining hosting completion job", {
                hostingId: (_a = result.hosting) === null || _a === void 0 ? void 0 : _a.id,
                error: schedulerError instanceof Error
                    ? schedulerError.message
                    : schedulerError,
            });
        }
        res.json({
            success: true,
            message: "Mining hosting cancelled successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to cancel hosting",
            error: error.message,
        });
    }
});
exports.cancelHosting = cancelHosting;
const pauseHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id);
        const result = yield hostingService.pauseHosting(hostingId, req.user.id);
        res.json({
            success: true,
            message: "Mining hosting paused successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to pause hosting",
            error: error.message,
        });
    }
});
exports.pauseHosting = pauseHosting;
const resumeHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id);
        const result = yield hostingService.resumeHosting(hostingId, req.user.id);
        try {
            mining_hosting_scheduler_1.default.scheduleCompletion(BigInt(result.hosting.id), result.hosting.end_date);
        }
        catch (schedulerError) {
            logger_1.logger.error("Failed to reschedule mining hosting completion", {
                hostingId: result.hosting.id,
                error: schedulerError instanceof Error
                    ? schedulerError.message
                    : schedulerError,
            });
        }
        res.json({
            success: true,
            message: "Mining hosting resumed successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to resume hosting",
            error: error.message,
        });
    }
});
exports.resumeHosting = resumeHosting;
