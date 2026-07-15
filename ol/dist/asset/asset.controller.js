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
exports.AssetController = void 0;
const asset_service_1 = __importDefault(require("./asset.service"));
const http_response_1 = require("../utils/http-response");
class AssetController {
    constructor(service = asset_service_1.default) {
        this.service = service;
    }
    getUserAssets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
                }
                const userId = BigInt(req.user.id);
                const [assets, totalValue] = yield Promise.all([
                    this.service.getUserAssets(userId),
                    this.service.getTotalAssetValue(userId),
                ]);
                return (0, http_response_1.successResponse)(res, {
                    assets,
                    total_value: totalValue,
                    count: assets.length,
                }, "User assets retrieved successfully");
            }
            catch (error) {
                return (0, http_response_1.errorResponse)(res, "Failed to get user assets", 500);
            }
        });
    }
    getTotalAssetValue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
                }
                const totalValue = yield this.service.getTotalAssetValue(BigInt(req.user.id));
                return (0, http_response_1.successResponse)(res, {
                    total_value: totalValue,
                }, "Total asset value retrieved successfully");
            }
            catch (error) {
                return (0, http_response_1.errorResponse)(res, "Failed to get total asset value", 500);
            }
        });
    }
    updateAssetPrices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
                }
                const result = yield this.service.updateAssetPrices(BigInt(req.user.id));
                return (0, http_response_1.successResponse)(res, {
                    assets: result.assets,
                    total_value: result.totalValue,
                    updated_at: new Date().toISOString(),
                }, "Asset prices updated successfully");
            }
            catch (error) {
                return (0, http_response_1.errorResponse)(res, "Failed to update asset prices", 500);
            }
        });
    }
    processSpotTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return (0, http_response_1.errorResponse)(res, "Unauthorized", 401);
                }
                const tradeId = BigInt(req.params.id);
                const trade = yield this.service.processSpotTrade(BigInt(req.user.id), tradeId);
                return (0, http_response_1.successResponse)(res, {
                    trade,
                    message: "Spot trade processed successfully",
                }, "Spot trade processed successfully");
            }
            catch (error) {
                const message = (_b = error.message) !== null && _b !== void 0 ? _b : "";
                if (message.includes("not found") || message.includes("eligible")) {
                    return (0, http_response_1.errorResponse)(res, "Trade not found or not eligible for processing", 404);
                }
                return (0, http_response_1.errorResponse)(res, `Failed to process spot trade: ${message}`.trim(), 500);
            }
        });
    }
}
exports.AssetController = AssetController;
exports.default = new AssetController();
