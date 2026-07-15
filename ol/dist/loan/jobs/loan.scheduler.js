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
exports.LoanScheduler = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const logger_1 = require("../../utils/logger");
const mailer_1 = require("../../utils/mailer");
const library_1 = require("@prisma/client/runtime/library");
const node_cron_1 = __importDefault(require("node-cron"));
class LoanScheduler {
    start() {
        // Run every day at midnight
        node_cron_1.default.schedule("0 0 * * *", () => {
            this.processDailyInterest();
        });
        logger_1.logger.info("Loan scheduler started.");
    }
    processDailyInterest() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info("Starting daily loan interest processing...");
            const activeLoans = yield prisma_1.default.loan.findMany({
                where: {
                    status: "approved",
                    repaid_at: null,
                },
                include: { user: true },
            });
            for (const loan of activeLoans) {
                try {
                    yield this.calculateInterest(loan);
                    yield this.checkDueReminders(loan);
                }
                catch (error) {
                    logger_1.logger.error(`Error processing loan ${loan.id}`, error);
                }
            }
            logger_1.logger.info("Completed daily loan interest processing.");
        });
    }
    calculateInterest(loan) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const lastInterestDate = loan.last_interest_date
                ? new Date(loan.last_interest_date)
                : null;
            if (lastInterestDate && this.isSameDay(lastInterestDate, today)) {
                return;
            }
            let dailyInterest;
            const isOverdue = loan.due_date && today > new Date(loan.due_date);
            if (isOverdue) {
                // Compound interest for overdue loans: Interest on Total Payable
                dailyInterest = new library_1.Decimal(loan.total_payable).mul(loan.interest_rate);
            }
            else {
                // Simple interest for active loans: Interest on Principal
                // partial payments is active if total_payable < original amount
                // Use original total_payable if partial payments exist
                const principalAmount = loan.total_payable < loan.amount ? loan.amount : loan.total_payable;
                dailyInterest = new library_1.Decimal(principalAmount).mul(loan.interest_rate);
            }
            yield prisma_1.default.loan.update({
                where: { id: loan.id },
                data: {
                    accumulated_interest: { increment: dailyInterest },
                    total_payable: { increment: dailyInterest },
                    last_interest_date: new Date(),
                },
            });
        });
    }
    checkDueReminders(loan) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!loan.due_date)
                return;
            const dueDate = new Date(loan.due_date);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 3) {
                if (loan.user.email) {
                    try {
                        yield (0, mailer_1.sendEmail)(loan.user.email, "Loan Repayment Reminder", `Dear ${loan.user.name || "User"}, your loan repayment of ${loan.total_payable} USDT is due in 3 days (${dueDate.toDateString()}). Please ensure your account has sufficient balance.`);
                    }
                    catch (e) {
                        logger_1.logger.error(`Failed to send reminder email to ${loan.user.email}`, e);
                    }
                }
            }
        });
    }
    isSameDay(d1, d2) {
        return (d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate());
    }
}
exports.LoanScheduler = LoanScheduler;
