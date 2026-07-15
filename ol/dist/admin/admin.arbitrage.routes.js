"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const arbitrage_admin_routes_1 = __importDefault(require("../arbitrage/arbitrage.admin.routes"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Arbitrage
 *     description: Aggregates arbitrage administration endpoints under /api/admin/arbitrage
 */
router.use("/", arbitrage_admin_routes_1.default);
exports.default = router;
