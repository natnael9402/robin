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
exports.ArbitrageHostingController = void 0;
const arbitrage_hosting_service_1 = require("./arbitrage-hosting.service");
const arbitrage_hosting_scheduler_1 = __importDefault(require("./jobs/arbitrage-hosting.scheduler"));
const logger_1 = require("../utils/logger");
class ArbitrageHostingController {
    constructor() {
        this.hostingService = new arbitrage_hosting_service_1.ArbitrageHostingService();
        this.getUserHostings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const hostings = yield this.hostingService.findUserHostings(userId);
                res.json({
                    success: true,
                    message: "Arbitrage hostings retrieved successfully",
                    data: hostings,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage hostings", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.getAllHostings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const hostings = yield this.hostingService.findAllHostings(req.query);
                res.json({
                    success: true,
                    message: "All arbitrage hostings retrieved successfully",
                    data: hostings,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage hostings", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.getHostingById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const hostingId = parseInt(req.params.id);
                const hosting = yield this.hostingService.findHostingById(hostingId);
                if (!hosting) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage hosting not found",
                    });
                    return;
                }
                // Check if user owns this hosting or is admin
                if (hosting.user_id !== BigInt(req.user.id) &&
                    req.user.role !== "admin") {
                    res.status(403).json({
                        success: false,
                        message: "Unauthorized",
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: "Arbitrage hosting retrieved successfully",
                    data: hosting,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage hosting", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.createHosting = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { product_id, amount, currency } = req.body;
                const userId = req.user.id;
                const result = yield this.hostingService.createHosting(userId, product_id, amount, currency);
                try {
                    const hostingId = BigInt(result.hosting.id);
                    arbitrage_hosting_scheduler_1.default.scheduleCompletion(hostingId, result.hosting.end_date);
                }
                catch (schedulerError) {
                    logger_1.logger.error("Failed to schedule arbitrage hosting completion", {
                        userId,
                        productId: product_id,
                        hostingId: (_a = result.hosting) === null || _a === void 0 ? void 0 : _a.id,
                        error: schedulerError instanceof Error
                            ? schedulerError.message
                            : schedulerError,
                    });
                }
                res.status(201).json({
                    success: true,
                    message: "Arbitrage hosting created successfully",
                    data: {
                        hosting: result.hosting,
                        new_balance: result.newBalance,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error("Error creating arbitrage hosting", error);
                let statusCode = 500;
                let message = "Server error";
                if (error.message.includes("not found")) {
                    statusCode = 404;
                    message = error.message;
                }
                else if (error.message.includes("not available")) {
                    statusCode = 400;
                    message = error.message;
                }
                else if (error.message.includes("Insufficient balance")) {
                    statusCode = 400;
                    message = error.message;
                }
                else if (error.message.includes("Amount must be between")) {
                    statusCode = 400;
                    message = error.message;
                }
                else if (error.message.includes("not supported")) {
                    statusCode = 400;
                    message = error.message;
                }
                res.status(statusCode).json({
                    success: false,
                    message,
                });
            }
        });
        this.updateHosting = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const hostingId = parseInt(req.params.id);
                const updateData = req.body;
                // Check if user owns this hosting or is admin
                const hosting = yield this.hostingService.findHostingById(hostingId);
                if (!hosting) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage hosting not found",
                    });
                    return;
                }
                if (hosting.user_id !== BigInt(req.user.id) &&
                    req.user.role !== "admin") {
                    res.status(403).json({
                        success: false,
                        message: "Unauthorized",
                    });
                    return;
                }
                if (req.user.role !== "admin" && updateData.status === "cancelled") {
                    const result = yield this.hostingService.cancelHosting(hostingId, req.user.id);
                    try {
                        arbitrage_hosting_scheduler_1.default.cancel(BigInt(result.hosting.id));
                    }
                    catch (schedulerError) {
                        logger_1.logger.error("Failed to cancel arbitrage hosting completion job", {
                            hostingId: (_a = result.hosting) === null || _a === void 0 ? void 0 : _a.id,
                            error: schedulerError instanceof Error
                                ? schedulerError.message
                                : schedulerError,
                        });
                    }
                    res.json({
                        success: true,
                        message: "Arbitrage hosting cancelled successfully",
                        data: {
                            hosting: result.hosting,
                            refund_amount: result.refundAmount,
                            new_balance: result.newBalance,
                        },
                    });
                    return;
                }
                // Users can only cancel their own hostings
                if (BigInt(req.user.id) === hosting.user_id &&
                    updateData.status &&
                    updateData.status !== "cancelled") {
                    res.status(400).json({
                        success: false,
                        message: "You can only cancel the hosting, not modify it",
                    });
                    return;
                }
                const updatedHosting = yield this.hostingService.updateHosting(hostingId, updateData);
                if (updatedHosting) {
                    try {
                        const updatedHostingId = BigInt(updatedHosting.id);
                        if (updatedHosting.status === "running") {
                            arbitrage_hosting_scheduler_1.default.scheduleCompletion(updatedHostingId, updatedHosting.end_date);
                        }
                        else {
                            arbitrage_hosting_scheduler_1.default.cancel(updatedHostingId);
                        }
                    }
                    catch (schedulerError) {
                        logger_1.logger.error("Failed to adjust arbitrage hosting completion job", {
                            hostingId: updatedHosting === null || updatedHosting === void 0 ? void 0 : updatedHosting.id,
                            error: schedulerError instanceof Error
                                ? schedulerError.message
                                : schedulerError,
                        });
                    }
                }
                res.json({
                    success: true,
                    message: "Arbitrage hosting updated successfully",
                    data: updatedHosting,
                });
            }
            catch (error) {
                logger_1.logger.error("Error updating arbitrage hosting", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.cancelHosting = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const hostingId = parseInt(req.params.id);
                const userId = req.user.id;
                const result = yield this.hostingService.cancelHosting(hostingId, userId);
                try {
                    arbitrage_hosting_scheduler_1.default.cancel(BigInt(result.hosting.id));
                }
                catch (schedulerError) {
                    logger_1.logger.error("Failed to cancel arbitrage hosting completion job", {
                        hostingId: (_a = result.hosting) === null || _a === void 0 ? void 0 : _a.id,
                        error: schedulerError instanceof Error
                            ? schedulerError.message
                            : schedulerError,
                    });
                }
                res.json({
                    success: true,
                    message: "Arbitrage hosting cancelled successfully",
                    data: {
                        hosting: result.hosting,
                        refund_amount: result.refundAmount,
                        new_balance: result.newBalance,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error("Error cancelling arbitrage hosting", error);
                let statusCode = 500;
                let message = "Server error";
                if (error.message.includes("not found")) {
                    statusCode = 404;
                    message = error.message;
                }
                else if (error.message.includes("Unauthorized")) {
                    statusCode = 403;
                    message = error.message;
                }
                else if (error.message.includes("Only running")) {
                    statusCode = 400;
                    message = error.message;
                }
                res.status(statusCode).json({
                    success: false,
                    message,
                });
            }
        });
        this.deleteHosting = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const hostingId = parseInt(req.params.id);
                // Only admins can delete hostings
                if (req.user.role !== "admin") {
                    res.status(403).json({
                        success: false,
                        message: "Unauthorized",
                    });
                    return;
                }
                const deleted = yield this.hostingService.deleteHosting(hostingId);
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage hosting not found",
                    });
                    return;
                }
                try {
                    arbitrage_hosting_scheduler_1.default.cancel(BigInt(hostingId));
                }
                catch (schedulerError) {
                    logger_1.logger.error("Failed to cancel arbitrage hosting completion job", {
                        hostingId,
                        error: schedulerError instanceof Error
                            ? schedulerError.message
                            : schedulerError,
                    });
                }
                res.json({
                    success: true,
                    message: "Arbitrage hosting deleted successfully",
                });
            }
            catch (error) {
                logger_1.logger.error("Error deleting arbitrage hosting", error);
                if (error.message.includes("running hosting")) {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
    }
}
exports.ArbitrageHostingController = ArbitrageHostingController;
