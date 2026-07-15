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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getTransaction = exports.getTransactions = void 0;
const transaction_classification_1 = require("./transaction.classification");
const transactionService = __importStar(require("./transaction.service"));
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, category } = req.query;
        const isAdmin = req.user.role === "admin";
        const normalizedType = typeof type === "string" ? type : undefined;
        const categoryFilter = typeof category === "string"
            ? (0, transaction_classification_1.parseTransactionCategory)(category)
            : undefined;
        const transactions = yield transactionService.getTransactions(req.user.id, isAdmin, normalizedType, categoryFilter);
        res.json({
            success: true,
            message: "Transactions retrieved successfully",
            data: transactions,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve transactions",
            error: error.message,
        });
    }
});
exports.getTransactions = getTransactions;
const getTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = BigInt(req.params.id);
        const isAdmin = req.user.role === "admin";
        const transaction = yield transactionService.getTransactionById(transactionId, req.user.id, isAdmin);
        if (!transaction) {
            return res
                .status(404)
                .json({ success: false, message: "Transaction not found" });
        }
        res.json({
            success: true,
            message: "Transaction retrieved successfully",
            data: transaction,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve transaction",
            error: error.message,
        });
    }
});
exports.getTransaction = getTransaction;
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield transactionService.getTransactionStats(req.user.id);
        res.json({
            success: true,
            message: "Transaction statistics retrieved successfully",
            data: stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve transaction stats",
            error: error.message,
        });
    }
});
exports.getStats = getStats;
