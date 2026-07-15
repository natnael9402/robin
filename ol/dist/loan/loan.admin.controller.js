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
exports.LoanAdminController = void 0;
const loan_service_1 = require("./loan.service");
const loanService = new loan_service_1.LoanService();
class LoanAdminController {
    getAllLoans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = req.query.status;
                const loans = yield loanService.getAllLoans(status);
                res.json(loans);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch loans", error });
            }
        });
    }
    approveLoan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = BigInt(req.user.id);
                const loanId = BigInt(req.params.id);
                const loan = yield loanService.approveLoan(loanId, adminId);
                res.json(loan);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to approve loan",
                    error: error.message,
                });
            }
        });
    }
    rejectLoan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = BigInt(req.user.id);
                const loanId = BigInt(req.params.id);
                const { reason } = req.body;
                if (!reason) {
                    return res
                        .status(400)
                        .json({ message: "Rejection reason is required" });
                }
                const loan = yield loanService.rejectLoan(loanId, adminId, reason);
                res.json(loan);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to reject loan",
                    error: error.message,
                });
            }
        });
    }
    getAllRepayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = req.query.status;
                const repayments = yield loanService.getAllRepayments(status);
                res.json(repayments);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to fetch repayments", error });
            }
        });
    }
    approveRepayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = BigInt(req.user.id);
                const repaymentId = BigInt(req.params.id);
                const repayment = yield loanService.approveRepayment(repaymentId, adminId);
                res.json(repayment);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to approve repayment",
                    error: error.message,
                });
            }
        });
    }
    rejectRepayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = BigInt(req.user.id);
                const repaymentId = BigInt(req.params.id);
                const { reason } = req.body;
                if (!reason) {
                    return res
                        .status(400)
                        .json({ message: "Rejection reason is required" });
                }
                const repayment = yield loanService.rejectRepayment(repaymentId, adminId, reason);
                res.json(repayment);
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to reject repayment",
                    error: error.message,
                });
            }
        });
    }
}
exports.LoanAdminController = LoanAdminController;
