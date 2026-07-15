"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_admin_controller_1 = require("./loan.admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const loanAdminController = new loan_admin_controller_1.LoanAdminController();
router.use(auth_middleware_1.authenticateJWT);
router.use(admin_middleware_1.authorizeAdmin);
/**
 * @swagger
 * /api/admin/loans/repayments:
 *   get:
 *     summary: Get all loan repayments (Admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by repayment status
 *     responses:
 *       200:
 *         description: List of all repayments
 *       500:
 *         description: Server error
 */
router.get("/repayments", loanAdminController.getAllRepayments);
/**
 * @swagger
 * /api/admin/loans/repayments/{id}/approve:
 *   post:
 *     summary: Approve a loan repayment (Admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Repayment ID
 *     responses:
 *       200:
 *         description: Repayment approved successfully
 *       500:
 *         description: Server error
 */
router.post("/repayments/:id/approve", loanAdminController.approveRepayment);
/**
 * @swagger
 * /api/admin/loans/repayments/{id}/reject:
 *   post:
 *     summary: Reject a loan repayment (Admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Repayment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Repayment rejected successfully
 *       500:
 *         description: Server error
 */
router.post("/repayments/:id/reject", loanAdminController.rejectRepayment);
/**
 * @swagger
 * /api/admin/loans:
 *   get:
 *     summary: Get all loans (Admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *         description: Filter by loan status
 *     responses:
 *       200:
 *         description: List of all loans
 *       500:
 *         description: Server error
 */
router.get("/", loanAdminController.getAllLoans);
/**
 * @swagger
 * /api/admin/loans/{id}/approve:
 *   post:
 *     summary: Approve a loan (Admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan approved successfully
 *       500:
 *         description: Server error
 */
router.post("/:id/approve", loanAdminController.approveLoan);
/**
 * @swagger
 * /api/admin/loans/{id}/reject:
 *   post:
 *     summary: Reject a loan (Admin)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Loan rejected successfully
 *       500:
 *         description: Server error
 */
router.post("/:id/reject", loanAdminController.rejectLoan);
exports.default = router;
