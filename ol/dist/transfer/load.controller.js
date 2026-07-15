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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadController = void 0;
const load_service_1 = require("./load.service");
const http_response_1 = require("../utils/http-response");
const logger_1 = require("../utils/logger");
class LoadController {
    constructor() {
        this.loadService = new load_service_1.LoadService();
        this.loadFromMain = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { to, amount } = req.body;
                if (!to || amount === undefined || amount === null) {
                    return (0, http_response_1.errorResponse)(res, "to and amount are required", 400);
                }
                const numAmount = Number(amount);
                if (isNaN(numAmount) || numAmount <= 0) {
                    return (0, http_response_1.errorResponse)(res, "Amount must be a positive number", 400);
                }
                const validTypes = ["spot", "trading", "fast_trade"];
                if (!validTypes.includes(to)) {
                    return (0, http_response_1.errorResponse)(res, "Invalid account type. Must be one of: spot, trading, fast_trade", 400);
                }
                const userId = BigInt(req.user.id);
                yield this.loadService.loadFromMain(userId, to, numAmount);
                return (0, http_response_1.successResponse)(res, null, "Load successful");
            }
            catch (error) {
                logger_1.logger.error("Load from main failed", error);
                return (0, http_response_1.errorResponse)(res, error.message || "Load failed", 400);
            }
        });
        this.transferToMain = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { from, amount } = req.body;
                if (!from || amount === undefined || amount === null) {
                    return (0, http_response_1.errorResponse)(res, "from and amount are required", 400);
                }
                const numAmount = Number(amount);
                if (isNaN(numAmount) || numAmount <= 0) {
                    return (0, http_response_1.errorResponse)(res, "Amount must be a positive number", 400);
                }
                const validTypes = ["spot", "trading", "fast_trade"];
                if (!validTypes.includes(from)) {
                    return (0, http_response_1.errorResponse)(res, "Invalid account type. Must be one of: spot, trading, fast_trade", 400);
                }
                const userId = BigInt(req.user.id);
                yield this.loadService.transferToMain(userId, from, numAmount);
                return (0, http_response_1.successResponse)(res, null, "Transfer to main wallet successful");
            }
            catch (error) {
                logger_1.logger.error("Transfer to main failed", error);
                return (0, http_response_1.errorResponse)(res, error.message || "Transfer failed", 400);
            }
        });
    }
}
exports.LoadController = LoadController;
