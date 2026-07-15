"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mining_admin_routes_1 = __importDefault(require("../mining/mining.admin.routes"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Admin Mining
 *     description: Aggregates mining administration endpoints under /api/admin/mining
 */
router.use("/", mining_admin_routes_1.default);
exports.default = router;
