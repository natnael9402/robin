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
exports.AdminTradeController = void 0;
const trade_service_1 = __importDefault(require("./trade.service"));
class AdminTradeController {
    constructor(service = trade_service_1.default) {
        this.service = service;
    }
    getAllTrades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filters = {
                    userId: req.query.user_id
                        ? BigInt(req.query.user_id)
                        : undefined,
                    type: req.query.type || undefined,
                    status: req.query.status || undefined,
                    result: req.query.result || undefined,
                    symbol: req.query.symbol || undefined,
                    direction: req.query.direction || undefined,
                    dateFrom: req.query.date_from || undefined,
                    dateTo: req.query.date_to || undefined,
                    sortBy: req.query.sort_by || undefined,
                    sortDir: req.query.sort_dir || undefined,
                    page: req.query.page ? Number(req.query.page) : undefined,
                    perPage: req.query.per_page ? Number(req.query.per_page) : undefined,
                };
                const trades = yield this.service.getAllTrades(filters);
                return res.json(trades);
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    }
    getTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tradeId = BigInt(req.params.id);
                const trade = yield this.service.getAdminTrade(tradeId);
                if (!trade) {
                    return res.status(404).json({ error: "Trade not found" });
                }
                return res.json({ trade });
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    }
    resolveTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const tradeId = BigInt(req.params.id);
                const trade = yield this.service.resolveTrade(tradeId, req.body.result, BigInt(req.user.id));
                return res.json({
                    message: "Trade status updated successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    cancelTrade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const tradeId = BigInt(req.params.id);
                const trade = yield this.service.cancelTradeByAdmin(tradeId, BigInt(req.user.id));
                return res.json({
                    message: "Trade canceled successfully",
                    trade,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
    getTradeStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.service.getAdminTradeStats();
                return res.json(stats);
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    }
    resolveAllUserTrades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const userId = BigInt(req.params.userId);
                const result = yield this.service.resolveAllUserTrades(userId, BigInt(req.user.id));
                return res.json({
                    message: `${result.resolvedCount} trades resolved successfully`,
                    result: result.result,
                });
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.AdminTradeController = AdminTradeController;
exports.default = new AdminTradeController();
