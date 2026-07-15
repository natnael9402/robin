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
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const logger_1 = require("../utils/logger");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
        this.getBalances = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const prisma_1 = require("../prisma");
                const balances = yield prisma_1.default.accountBalance.findMany({
                    where: { user_id: BigInt(userId) }
                });
                const result = { spot: 0, trading: 0, fast_trade: 0, total: 0 };
                for (const b of balances) {
                    if (b.type === "spot") result.spot = Number(b.balance);
                    if (b.type === "trading") result.trading = Number(b.balance);
                    if (b.type === "fast_trade") result.fast_trade = Number(b.balance);
                }
                result.total = result.spot + result.trading + result.fast_trade;
                res.json(result);
            }
            catch (error) {
                logger_1.logger.error("Error fetching balances", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.getProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const user = yield this.userService.findUserById(userId);
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(user);
            }
            catch (error) {
                logger_1.logger.error("Error fetching user profile", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.getAllUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userService.findAllUsers(req.query);
                res.json(users);
            }
            catch (error) {
                logger_1.logger.error("Error fetching users", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.getUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                const user = yield this.userService.findUserById(userId);
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(user);
            }
            catch (error) {
                logger_1.logger.error("Error fetching user", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.updateUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                const updateData = req.body;
                const updatedUser = yield this.userService.updateUser(userId, updateData);
                if (!updatedUser) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(updatedUser);
            }
            catch (error) {
                logger_1.logger.error("Error updating user", error);
                res.status(500).json({ message: "Server error" });
            }
        });
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.id);
                yield this.userService.deleteUser(userId);
                res.json({ message: "User deleted successfully" });
            }
            catch (error) {
                logger_1.logger.error("Error deleting user", error);
                res.status(500).json({ message: "Server error" });
            }
        });
    }
}
exports.UserController = UserController;
