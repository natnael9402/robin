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
exports.TransferController = void 0;
const transfer_service_1 = require("./transfer.service");
const http_response_1 = require("../utils/http-response");
const logger_1 = require("../utils/logger");
class TransferController {
    constructor() {
        this.transferService = new transfer_service_1.TransferService();
        this.transfer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { from, to, amount } = req.body;
                if (!from || !to || amount === undefined || amount === null) {
                    return (0, http_response_1.errorResponse)(res, "from, to, and amount are required", 400);
                }
                const numAmount = Number(amount);
                if (isNaN(numAmount) || numAmount <= 0) {
                    return (0, http_response_1.errorResponse)(res, "Amount must be a positive number", 400);
                }
                const validTypes = ["spot", "trading", "fast_trade"];
                if (!validTypes.includes(from) || !validTypes.includes(to)) {
                    return (0, http_response_1.errorResponse)(res, "Invalid account type. Must be one of: spot, trading, fast_trade", 400);
                }
                if (from === to) {
                    return (0, http_response_1.errorResponse)(res, "Cannot transfer to the same account", 400);
                }
                const userId = BigInt(req.user.id);
                yield this.transferService.transfer(userId, from, to, numAmount);
                return (0, http_response_1.successResponse)(res, null, "Transfer successful");
            }
            catch (error) {
                logger_1.logger.error("Transfer failed", error);
                return (0, http_response_1.errorResponse)(res, error.message || "Transfer failed", 400);
            }
        });
    }
}
exports.TransferController = TransferController;
