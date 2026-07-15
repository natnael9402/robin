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
exports.getDepositAddress = exports.getDepositAddresses = void 0;
const cryptoAddressService = __importStar(require("./crypto-address.service"));
const prisma_1 = __importDefault(require("../prisma"));
const http_response_1 = require("../utils/http-response");
const getDepositAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { profiles: true },
        });
        if (!(user === null || user === void 0 ? void 0 : user.profiles[0]) ||
            !["approved", "verified"].includes(user.profiles[0].kyc_status)) {
            return (0, http_response_1.errorResponse)(res, "Your KYC must be approved to view deposit addresses", 403);
        }
        const addresses = yield cryptoAddressService.getDepositAddresses();
        if (Object.keys(addresses).length === 0) {
            return (0, http_response_1.errorResponse)(res, "No deposit addresses available", 404);
        }
        return (0, http_response_1.successResponse)(res, {
            addresses,
            instructions: "Please send only the specified cryptocurrency to its corresponding address. Sending the wrong cryptocurrency may result in permanent loss of funds.",
            min_deposit: {
                USDT: 10,
                BTC: 0.0005,
                ETH: 0.01,
            },
        }, "Deposit addresses retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve deposit addresses", 500, error.message);
    }
});
exports.getDepositAddresses = getDepositAddresses;
const getDepositAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currency, network } = req.params;
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { profiles: true },
        });
        if (!(user === null || user === void 0 ? void 0 : user.profiles[0]) ||
            !["approved", "verified"].includes(user.profiles[0].kyc_status)) {
            return (0, http_response_1.errorResponse)(res, "Your KYC must be approved to view deposit addresses", 403);
        }
        const address = yield cryptoAddressService.getDepositAddress(currency, network);
        if (!address) {
            return (0, http_response_1.errorResponse)(res, "No deposit address available for the specified currency and network", 404);
        }
        const minDeposits = {
            USDT: 10,
            BTC: 0.0005,
            ETH: 0.01,
        };
        return (0, http_response_1.successResponse)(res, {
            data: {
                currency: address.currency,
                network: address.network,
                address: address.address,
                qr_code: address.qr_code,
                min_deposit: (_a = minDeposits[address.currency]) !== null && _a !== void 0 ? _a : 10,
                instructions: `Please send only ${address.currency} to this address. Sending the wrong cryptocurrency may result in permanent loss of funds.`,
                processing_time: "Deposits typically take 10-30 minutes to process depending on network congestion.",
                last_updated: address.last_updated,
            },
        }, "Deposit address retrieved successfully");
    }
    catch (error) {
        return (0, http_response_1.errorResponse)(res, "Failed to retrieve deposit address", 500, error.message);
    }
});
exports.getDepositAddress = getDepositAddress;
