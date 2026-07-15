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
exports.deleteHosting = exports.updateHostingStatus = exports.processHostingProfits = exports.getHosting = exports.listHostings = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const productService = __importStar(require("./mining-product.service"));
const hostingService = __importStar(require("./mining-hosting.service"));
const mining_hosting_scheduler_1 = __importDefault(require("./jobs/mining-hosting.scheduler"));
const logger_1 = require("../utils/logger");
const listProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield productService.getAdminProducts();
        res.json({
            success: true,
            message: "Mining products retrieved successfully",
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve mining products",
            error: error.message,
        });
    }
});
exports.listProducts = listProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = yield productService.getProductById(productId);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Mining product not found" });
        }
        res.json({
            success: true,
            message: "Mining product retrieved successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve mining product",
            error: error.message,
        });
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: "Mining product created successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create mining product",
            error: error.message,
        });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = yield productService.updateProduct(productId, req.body);
        res.json({
            success: true,
            message: "Mining product updated successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update mining product",
            error: error.message,
        });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.id, 10);
        yield productService.deleteProduct(productId);
        res.json({
            success: true,
            message: "Mining product deleted successfully",
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Cannot delete a product with active hostings") {
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete mining product",
            error: message,
        });
    }
});
exports.deleteProduct = deleteProduct;
const listHostings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId } = req.query;
        const hostings = yield hostingService.getAdminHostings(status, userId ? Number(userId) : undefined);
        res.json({
            success: true,
            message: "Mining hostings retrieved successfully",
            data: hostings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve mining hostings",
            error: error.message,
        });
    }
});
exports.listHostings = listHostings;
const getHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        const hosting = yield hostingService.getAdminHostingById(hostingId);
        if (!hosting) {
            return res
                .status(404)
                .json({ success: false, message: "Mining hosting not found" });
        }
        res.json({
            success: true,
            message: "Mining hosting retrieved successfully",
            data: hosting,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve mining hosting",
            error: error.message,
        });
    }
});
exports.getHosting = getHosting;
const processHostingProfits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        const result = yield hostingService.processHostingProfitsByAdmin(hostingId);
        res.json({
            success: true,
            message: "Mining hosting profits processed successfully",
            data: result,
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Hosting not found") {
            return res.status(404).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to process hosting profits",
            error: message,
        });
    }
});
exports.processHostingProfits = processHostingProfits;
const updateHostingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const hostingId = parseInt(req.params.id, 10);
        const { status } = req.body;
        const result = yield hostingService.updateHostingStatusAsAdmin(hostingId, status);
        try {
            const scheduledHostingId = BigInt(result.hosting.id);
            if (result.hosting.status === "running") {
                mining_hosting_scheduler_1.default.scheduleCompletion(scheduledHostingId, (_a = result.hosting.end_date) !== null && _a !== void 0 ? _a : undefined);
            }
            else {
                mining_hosting_scheduler_1.default.cancel(scheduledHostingId);
            }
        }
        catch (schedulerError) {
            logger_1.logger.error("Failed to adjust mining hosting completion job", {
                hostingId: (_b = result.hosting) === null || _b === void 0 ? void 0 : _b.id,
                status: (_c = result.hosting) === null || _c === void 0 ? void 0 : _c.status,
                error: schedulerError instanceof Error ? schedulerError.message : schedulerError,
            });
        }
        res.json({
            success: true,
            message: "Mining hosting status updated successfully",
            data: result,
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Hosting not found") {
            return res.status(404).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to update hosting status",
            error: message,
        });
    }
});
exports.updateHostingStatus = updateHostingStatus;
const deleteHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        yield hostingService.deleteHostingAsAdmin(hostingId);
        try {
            mining_hosting_scheduler_1.default.cancel(BigInt(hostingId));
        }
        catch (schedulerError) {
            logger_1.logger.error("Failed to cancel mining hosting completion job", {
                hostingId,
                error: schedulerError instanceof Error ? schedulerError.message : schedulerError,
            });
        }
        res.json({
            success: true,
            message: "Mining hosting deleted successfully",
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Hosting not found") {
            return res.status(404).json({ success: false, message });
        }
        if (message === "Cannot delete a running hosting") {
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete mining hosting",
            error: message,
        });
    }
});
exports.deleteHosting = deleteHosting;
