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
exports.LoanService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const mailer_1 = require("../utils/mailer");
const logger_1 = require("../utils/logger");
const BRAND_NAME = process.env.BRAND_NAME || "Uphold Trading";
const FRONT_END_URL = process.env.FRONT_END_URL || "https://upholdtrading.com";
const generateEmailHtml = (content) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
  .header { background-color: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
  .content { padding: 20px; white-space: pre-wrap; }
  .footer { font-size: 0.8em; text-align: center; margin-top: 20px; color: #777; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${BRAND_NAME}</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
class LoanService {
    applyLoan(userId, amount, duration, documentType, frontImage, backImage) {
        return __awaiter(this, void 0, void 0, function* () {
            let interestRate = 0.01; // Default 1%
            if (duration === 60)
                interestRate = 0.008;
            if (duration === 90)
                interestRate = 0.005;
            const loan = yield prisma_1.default.loan.create({
                data: {
                    user_id: userId,
                    amount: new library_1.Decimal(amount),
                    duration: duration,
                    interest_rate: new library_1.Decimal(interestRate),
                    total_payable: new library_1.Decimal(amount),
                    document_type: documentType,
                    front_image: frontImage,
                    back_image: backImage,
                    status: "pending",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
            if (user === null || user === void 0 ? void 0 : user.email) {
                try {
                    const emailContent = `Dear Customer,

We hope you are doing well. We are contacting you regarding your recent loan application. To ensure your request is processed smoothly and accurately, we kindly need to review some details related to your loan.

Our team is dedicated to keeping you informed and providing excellent service throughout this process.

Thank you for choosing us, and we appreciate your cooperation.

${BRAND_NAME}`;
                    yield (0, mailer_1.sendEmail)(user.email, "Regarding your recent loan application", undefined, generateEmailHtml(emailContent));
                }
                catch (e) {
                    logger_1.logger.error("Failed to send loan application email", e);
                }
            }
            return loan;
        });
    }
    getLoans(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.loan.findMany({
                where: { user_id: userId },
                orderBy: { created_at: "desc" },
            });
        });
    }
    getAllLoans(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.loan.findMany({
                where: status ? { status } : {},
                include: { user: true },
                orderBy: { created_at: "desc" },
            });
        });
    }
    approveLoan(loanId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const loan = yield tx.loan.findUnique({
                    where: { id: loanId },
                    include: { user: true },
                });
                if (!loan)
                    throw new Error("Loan not found");
                if (loan.status !== "pending")
                    throw new Error("Loan is not pending");
                const updatedUser = yield tx.user.update({
                    where: { id: loan.user_id },
                    data: {
                        balance: { increment: loan.amount },
                    },
                });
                const updatedLoan = yield tx.loan.update({
                    where: { id: loanId },
                    data: {
                        status: "approved",
                        approved_at: new Date(),
                        processed_by: adminId,
                        processed_at: new Date(),
                        due_date: new Date(Date.now() + loan.duration * 24 * 60 * 60 * 1000),
                        last_interest_date: new Date(),
                        updated_at: new Date(),
                    },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: loan.user_id,
                        type: "loan_disbursement",
                        amount: loan.amount,
                        balance: updatedUser.balance,
                        description: `Loan approved #${loan.id}`,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });
                if (loan.user.email) {
                    try {
                        const emailContent = `Dear Customer,

We are pleased to inform you that your loan application has been approved.

Please note that, according to our company rules and regulations, loan repayments cannot be made using funds that are already available in your account. A new payment and a new purchase are required in order to proceed with the loan repayment process within the given address on the loan application.

Kindly ensure that your loan payment is made on time. Overdue payments may affect your account level and could limit your ability to access higher credit amounts in the future.

If you have any questions or require further clarification, please do not hesitate to contact our support team. We are here to assist you.

Thank you for choosing our services.

Best regards, ${BRAND_NAME}
Customer Support Team`;
                        yield (0, mailer_1.sendEmail)(loan.user.email, "Loan Application Approved", undefined, generateEmailHtml(emailContent));
                    }
                    catch (e) {
                        logger_1.logger.error("Failed to send loan approval email", e);
                    }
                }
                return updatedLoan;
            }));
        });
    }
    rejectLoan(loanId, adminId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const loan = yield prisma_1.default.loan.findUnique({
                where: { id: loanId },
                include: { user: true },
            });
            if (!loan)
                throw new Error("Loan not found");
            if (loan.status !== "pending")
                throw new Error("Loan is not pending");
            const updatedLoan = yield prisma_1.default.loan.update({
                where: { id: loanId },
                data: {
                    status: "rejected",
                    rejection_reason: reason,
                    processed_by: adminId,
                    processed_at: new Date(),
                    updated_at: new Date(),
                },
            });
            if (loan.user.email) {
                try {
                    const emailContent = `Dear Customer,

We regret to inform you that your recent loan application has been declined after a careful review of your request.

Reason for rejection: ${reason}

We understand this may be disappointing news. However, you are welcome to apply again in the future once you meet our eligibility criteria or if your circumstances change.

If you have any questions or need further clarification regarding this decision, please do not hesitate to contact our support team.

Best regards,
${BRAND_NAME}
Customer Support Team`;
                    yield (0, mailer_1.sendEmail)(loan.user.email, "Loan Application Update", undefined, generateEmailHtml(emailContent));
                }
                catch (e) {
                    logger_1.logger.error("Failed to send loan rejection email", e);
                }
            }
            return updatedLoan;
        });
    }
    repayLoan(loanId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const loan = yield tx.loan.findUnique({
                    where: { id: loanId },
                    include: { user: true },
                });
                if (!loan)
                    throw new Error("Loan not found");
                if (loan.user_id !== userId)
                    throw new Error("Unauthorized");
                if (loan.status !== "approved" && loan.status !== "overdue") {
                    throw new Error("Loan is not active");
                }
                const user = yield tx.user.findUnique({ where: { id: userId } });
                if (!user || new library_1.Decimal(user.balance).lessThan(loan.amount)) {
                    throw new Error("Insufficient balance");
                }
                const updatedUser = yield tx.user.update({
                    where: { id: userId },
                    data: {
                        balance: { decrement: loan.amount },
                    },
                });
                const updatedLoan = yield tx.loan.update({
                    where: { id: loanId },
                    data: {
                        status: "repaid",
                        repaid_at: new Date(),
                        updated_at: new Date(),
                    },
                });
                yield tx.transaction.create({
                    data: {
                        user_id: userId,
                        type: "loan_repayment",
                        amount: loan.amount.mul(-1),
                        balance: updatedUser.balance,
                        description: `Loan repayment #${loan.id}`,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });
                return updatedLoan;
            }));
        });
    }
    submitRepayment(loanId, userId, amount, proofImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const loan = yield prisma_1.default.loan.findUnique({
                where: { id: loanId },
            });
            if (!loan)
                throw new Error("Loan not found");
            if (loan.user_id !== userId)
                throw new Error("Unauthorized");
            if (loan.status !== "approved" && loan.status !== "overdue") {
                throw new Error("Loan is not active");
            }
            // 1. Minimum Payment Logic: at least 10% of total_payable
            const minimumPayment = new library_1.Decimal(loan.total_payable).mul(0.1);
            if (new library_1.Decimal(amount).lessThan(minimumPayment)) {
                throw new Error(`Minimum repayment amount is ${minimumPayment.toFixed(2)} USDT (10% of total payable)`);
            }
            return prisma_1.default.loanRepayment.create({
                data: {
                    loan_id: loanId,
                    amount: new library_1.Decimal(amount),
                    proof_image: proofImage,
                    status: "pending",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
        });
    }
    getRepayments(loanId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const loan = yield prisma_1.default.loan.findUnique({
                where: { id: loanId },
            });
            if (!loan)
                throw new Error("Loan not found");
            if (loan.user_id !== userId)
                throw new Error("Unauthorized");
            return prisma_1.default.loanRepayment.findMany({
                where: { loan_id: loanId },
                orderBy: { created_at: "desc" },
            });
        });
    }
    getAllRepayments(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.loanRepayment.findMany({
                where: status ? { status } : {},
                include: { loan: { include: { user: true } } },
                orderBy: { created_at: "desc" },
            });
        });
    }
    approveRepayment(repaymentId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const repayment = yield tx.loanRepayment.findUnique({
                    where: { id: repaymentId },
                    include: { loan: { include: { user: true } } },
                });
                if (!repayment)
                    throw new Error("Repayment not found");
                if (repayment.status !== "pending")
                    throw new Error("Repayment is not pending");
                const updatedRepayment = yield tx.loanRepayment.update({
                    where: { id: repaymentId },
                    data: {
                        status: "approved",
                        processed_by: adminId,
                        processed_at: new Date(),
                        updated_at: new Date(),
                    },
                });
                // Calculate new total payable
                const currentPayable = new library_1.Decimal(repayment.loan.total_payable);
                const repaymentAmount = new library_1.Decimal(repayment.amount);
                const newTotalPayable = currentPayable.minus(repaymentAmount);
                // Check if fully repaid (allow small margin for float issues)
                const isFullyRepaid = newTotalPayable.lessThanOrEqualTo(0);
                yield tx.loan.update({
                    where: { id: repayment.loan_id },
                    data: {
                        total_payable: isFullyRepaid ? new library_1.Decimal(0) : newTotalPayable,
                        status: isFullyRepaid ? "repaid" : repayment.loan.status,
                        repaid_at: isFullyRepaid ? new Date() : null,
                        updated_at: new Date(),
                    },
                });
                if (repayment.loan.user.email) {
                    try {
                        let subject = "";
                        let emailContent = "";
                        if (isFullyRepaid) {
                            subject = "Loan Repayment Successful";
                            emailContent = `Dear Customer,

We are pleased to inform you that your loan has been paid successfully.

If you wish to apply for another loan, you may submit a new request at any time through your account.

Should you need any assistance or further information, please feel free to contact us.

Best regards,
Customer Support Team`;
                        }
                        else {
                            subject = "Partial Repayment Received";
                            emailContent = `Dear Customer,

We have received your partial payment of ${repaymentAmount} USDT.

Your remaining loan balance is ${newTotalPayable} USDT.

Please ensure the remaining balance is paid by the due date to avoid penalties.

If you have any questions, please contact our support team.

Best regards,
${BRAND_NAME}
Customer Support Team`;
                        }
                        yield (0, mailer_1.sendEmail)(repayment.loan.user.email, subject, undefined, generateEmailHtml(emailContent));
                    }
                    catch (e) {
                        logger_1.logger.error("Failed to send loan repayment approval email", e);
                    }
                }
                return updatedRepayment;
            }));
        });
    }
    rejectRepayment(repaymentId, adminId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const repayment = yield prisma_1.default.loanRepayment.findUnique({
                where: { id: repaymentId },
                include: { loan: { include: { user: true } } },
            });
            if (!repayment)
                throw new Error("Repayment not found");
            if (repayment.status !== "pending")
                throw new Error("Repayment is not pending");
            const updatedRepayment = yield prisma_1.default.loanRepayment.update({
                where: { id: repaymentId },
                data: {
                    status: "rejected",
                    rejection_reason: reason,
                    processed_by: adminId,
                    processed_at: new Date(),
                    updated_at: new Date(),
                },
            });
            if (repayment.loan.user.email) {
                try {
                    const emailContent = `Dear Customer,

We are writing to inform you that your recent loan repayment submission has been declined.

Reason for rejection: ${reason}

Please review the details of your repayment and ensure all information and proofs provided are correct. You may submit a new repayment request through your account dashboard.

If you believe this decision was made in error or if you require assistance, please contact our support team.

Best regards,
${BRAND_NAME}
Customer Support Team`;
                    yield (0, mailer_1.sendEmail)(repayment.loan.user.email, "Loan Repayment Update", undefined, generateEmailHtml(emailContent));
                }
                catch (e) {
                    logger_1.logger.error("Failed to send loan repayment rejection email", e);
                }
            }
            return updatedRepayment;
        });
    }
}
exports.LoanService = LoanService;
