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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = require("./logger");
function migrateBalances() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield prisma_1.default.user.findMany({
            where: { balance: { gt: 0 } },
            select: { id: true, balance: true, name: true, email: true },
        });
        if (users.length === 0) {
            logger_1.logger.info("No users with User.balance > 0 found. Nothing to migrate.");
            return;
        }
        logger_1.logger.info(`Found ${users.length} users with User.balance > 0. Migrating to fast_trade...`);
        let migrated = 0;
        let skipped = 0;
        for (const user of users) {
            try {
                const amount = user.balance;
                if (amount.lte(0)) {
                    skipped++;
                    continue;
                }
                yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedAccount = yield tx.accountBalance.upsert({
                        where: { user_id_type: { user_id: user.id, type: "fast_trade" } },
                        create: { user_id: user.id, type: "fast_trade", balance: amount },
                        update: { balance: { increment: amount } },
                    });
                    yield tx.transaction.create({
                        data: {
                            user_id: user.id,
                            type: "transfer",
                            amount: amount,
                            balance: updatedAccount.balance,
                            description: `Migration: moved User.balance (${amount}) to fast_trade account`,
                        },
                    });
                }));
                migrated++;
                logger_1.logger.info(`Migrated user ${user.id} (${user.email || user.name}): ${amount} → fast_trade`);
            }
            catch (error) {
                logger_1.logger.error(`Failed to migrate user ${user.id}`, {
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        logger_1.logger.info(`Migration complete. Migrated: ${migrated}, Skipped: ${skipped}`);
    });
}
migrateBalances()
    .then(() => {
    logger_1.logger.info("Balance migration script finished.");
    process.exit(0);
})
    .catch((error) => {
    logger_1.logger.error("Balance migration script failed", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
