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
exports.getUserDeleteImpact = exports.purgeUserByAdmin = exports.restoreUserByAdmin = exports.deleteUserByAdmin = void 0;
const prisma_1 = require("../prisma");
const logger_1 = require("../utils/logger");
const blob_storage_1 = require("../utils/blob-storage");

const ACCOUNT_KEYS = [
    { key: "fastTrade", type: "fast_trade", label: "Fast Trade" },
    { key: "spot", type: "spot", label: "Spot" },
    { key: "trading", type: "trading", label: "Trading" },
];
const MAX_REASON_LENGTH = 500;
const normaliseReason = (reason) => {
    const trimmed = typeof reason === "string" ? reason.trim() : "";
    if (!trimmed) {
        const err = new Error("A reason is required to delete a user");
        err.statusCode = 400;
        err.code = "REASON_REQUIRED";
        throw err;
    }
    if (trimmed.length > MAX_REASON_LENGTH) {
        const err = new Error(`Reason must be ${MAX_REASON_LENGTH} characters or fewer`);
        err.statusCode = 400;
        err.code = "REASON_TOO_LONG";
        throw err;
    }
    return trimmed;
};
const toNumber = (value) => {
    if (value === null || value === undefined)
        return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};
const httpError = (message, statusCode, code) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    if (code)
        err.code = code;
    return err;
};
/**
 * The existing convention across this codebase is an email substring match
 * rather than a role or flag. Kept for consistency with updateUserByAdmin so
 * both paths protect the same accounts.
 */
const isProtectedAccount = (user) => Boolean(user.email && user.email.includes("superadmin"));
/**
 * Rejects deleting the account you are authenticated as, and refuses to remove
 * the last remaining admin (which would lock everyone out of the panel).
 */
const assertNotSelfOrLastAdmin = (target, actingAdminId) => {
    if (actingAdminId !== null && actingAdminId !== undefined && String(actingAdminId) === String(target.id)) {
        throw httpError("You cannot delete the account you are signed in with", 403, "SELF_DELETE");
    }
    if (target.role === "admin") {
        throw httpError("Admin accounts cannot be deleted from user management. Use Admin Accounts instead.", 403, "ADMIN_DELETE");
    }
};
/**
 * Dry run backing the delete confirmation modal: what this user holds, how much
 * of it, and what would be removed alongside them. Never mutates.
 */
const getUserDeleteImpact = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: BigInt(id) },
        include: { accountBalances: true },
    });
    if (!user) {
        throw httpError("User not found", 404, "NOT_FOUND");
    }
    if (isProtectedAccount(user)) {
        throw httpError("This account is protected and cannot be deleted", 403, "PROTECTED");
    }
    const accountMap = new Map((user.accountBalances || []).map((row) => [row.type, toNumber(row.balance)]));
    const balances = {};
    let total = 0;
    for (const entry of ACCOUNT_KEYS) {
        const amount = toNumber(accountMap.get(entry.type));
        balances[entry.key] = amount;
        total += amount;
    }
    const userId = BigInt(id);
    const [
        trades,
        openTrades,
        deposits,
        pendingDeposits,
        withdrawals,
        pendingWithdrawals,
        loans,
        openLoans,
        assets,
        kycSubmissions,
        supportTickets,
        notifications,
        transactions,
        referralCommissions,
    ] = yield Promise.all([
        prisma_1.default.trade.count({ where: { user_id: userId } }),
        prisma_1.default.trade.count({ where: { user_id: userId, status: "open" } }),
        prisma_1.default.deposit.count({ where: { user_id: userId } }),
        prisma_1.default.deposit.count({ where: { user_id: userId, status: "pending" } }),
        prisma_1.default.withdrawal.count({ where: { user_id: userId } }),
        prisma_1.default.withdrawal.count({ where: { user_id: userId, status: "pending" } }),
        prisma_1.default.loan.count({ where: { user_id: userId } }),
        prisma_1.default.loan.count({ where: { user_id: userId, status: { in: ["approved", "overdue"] } } }),
        prisma_1.default.asset.count({ where: { user_id: userId } }),
        prisma_1.default.kycSubmission.count({ where: { user_id: userId } }),
        prisma_1.default.supportTicket.count({ where: { user_id: userId } }),
        prisma_1.default.notification.count({ where: { user_id: userId } }),
        prisma_1.default.transaction.count({ where: { user_id: userId } }),
        prisma_1.default.referralCommission.count({ where: { referred_user_id: userId } }),
    ]);
    const counts = {
        trades,
        openTrades,
        deposits,
        pendingDeposits,
        withdrawals,
        pendingWithdrawals,
        loans,
        openLoans,
        assets,
        kycSubmissions,
        supportTickets,
        notifications,
        transactions,
        referralCommissions,
    };
    // Advisory only. The product decision is to warn and let the admin proceed,
    // so nothing here blocks; the modal renders them as a heads-up panel.
    const warnings = [];
    if (total > 0) {
        warnings.push({
            code: "BALANCE",
            label: `Holds ${total.toFixed(2)} USDT across ${ACCOUNT_KEYS.filter((a) => balances[a.key] > 0).length} account(s)`,
            detail: "Purging permanently destroys this balance.",
        });
    }
    if (openTrades > 0) {
        warnings.push({
            code: "OPEN_TRADES",
            label: `${openTrades} trade(s) still open`,
            detail: "These positions will be removed with the account.",
        });
    }
    if (pendingDeposits > 0) {
        warnings.push({
            code: "PENDING_DEPOSITS",
            label: `${pendingDeposits} deposit(s) awaiting review`,
            detail: "Pending deposits will be removed without being processed.",
        });
    }
    if (pendingWithdrawals > 0) {
        warnings.push({
            code: "PENDING_WITHDRAWALS",
            label: `${pendingWithdrawals} withdrawal(s) awaiting payout`,
            detail: "Funds in flight may not reach the user.",
        });
    }
    if (openLoans > 0) {
        warnings.push({
            code: "OPEN_LOANS",
            label: `${openLoans} loan(s) outstanding`,
            detail: "Outstanding debt is not settled by deletion.",
        });
    }
    if (referralCommissions > 0) {
        warnings.push({
            code: "REFERRALS",
            label: `${referralCommissions} referral commission record(s)`,
            detail: "Commission history for this referral is removed.",
        });
    }
    return {
        user: {
            id: Number(user.id),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
        },
        balances: { ...balances, total },
        counts,
        warnings,
    };
});
exports.getUserDeleteImpact = getUserDeleteImpact;
/**
 * Soft delete. Archives a snapshot to `deleted_accounts`, stamps deleted_at, and
 * signs the user out. Fully reversible via restoreUserByAdmin.
 *
 * The password reset token must be cleared by email: password_reset_tokens is
 * keyed on email with no FK, so a surviving token would let the deleted address
 * complete a reset and resurrect the account via AuthService.resetPassword.
 */
const deleteUserByAdmin = (id, options) => __awaiter(void 0, void 0, void 0, function* () {
    const opts = options || {};
    const reason = normaliseReason(opts.reason);
    const userId = BigInt(id);
    const user = yield prisma_1.default.user.findFirst({
        where: { id: userId, deleted_at: null },
        include: { accountBalances: true },
    });
    if (!user) {
        // The lookup above is filtered to live rows, so fall back to the escape
        // hatch purely to tell "already archived" apart from "no such user".
        const archived = yield prisma_1.default.user.findFirst({
            where: { id: userId, deleted_at: { not: null } },
            select: { id: true },
        });
        if (archived) {
            throw httpError("This user is already deleted", 409, "ALREADY_DELETED");
        }
        throw httpError("User not found", 404, "NOT_FOUND");
    }
    if (isProtectedAccount(user)) {
        throw httpError("Deletion of protected account is not allowed", 403, "PROTECTED");
    }
    assertNotSelfOrLastAdmin(user, opts.adminId);
    const accountMap = new Map((user.accountBalances || []).map((row) => [row.type, toNumber(row.balance)]));
    const deletedAt = new Date();
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        return __awaiter(this, void 0, void 0, function* () {
            yield tx.deletedAccount.upsert({
                where: { original_user_id: userId },
                create: {
                    original_user_id: userId,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    balance: user.balance,
                    fast_trade_balance: toNumber(accountMap.get("fast_trade")),
                    spot_balance: toNumber(accountMap.get("spot")),
                    trading_balance: toNumber(accountMap.get("trading")),
                    role: user.role,
                    reason,
                    deleted_by: opts.adminId ? BigInt(opts.adminId) : null,
                    deleted_at: deletedAt,
                    deleted_by_ip: opts.ip || null,
                },
                update: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    balance: user.balance,
                    fast_trade_balance: toNumber(accountMap.get("fast_trade")),
                    spot_balance: toNumber(accountMap.get("spot")),
                    trading_balance: toNumber(accountMap.get("trading")),
                    role: user.role,
                    reason,
                    deleted_by: opts.adminId ? BigInt(opts.adminId) : null,
                    deleted_at: deletedAt,
                    deleted_by_ip: opts.ip || null,
                },
            });
            yield tx.user.update({
                where: { id: userId },
                data: {
                    deleted_at: deletedAt,
                    // Inactive blocks login; the JWT itself is stateless and
                    // remains cryptographically valid until it expires.
                    status: "inactive",
                    remember_token: null,
                },
            });
            if (user.email) {
                yield tx.passwordResetToken.deleteMany({ where: { email: user.email } });
            }
        });
    }));
    logger_1.logger.info("User soft deleted by admin", {
        userId: String(userId),
        adminId: opts.adminId ? String(opts.adminId) : null,
        reason,
        ip: opts.ip,
    });
    return { id: Number(userId), deletedAt, reason };
});
exports.deleteUserByAdmin = deleteUserByAdmin;
/**
 * Reverses a soft delete. Clears deleted_at, reactivates the account, and drops
 * the archive row so the unique original_user_id is freed for a future delete.
 */
const restoreUserByAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = BigInt(id);
    // Explicit deleted_at present in `where`, so the central soft-delete filter
    // steps aside and archived users stay reachable here.
    const user = yield prisma_1.default.user.findFirst({
        where: { id: userId, deleted_at: { not: null } },
    });
    if (!user) {
        throw httpError("User not found or not deleted", 404, "NOT_FOUND");
    }
    if (isProtectedAccount(user)) {
        throw httpError("This account is protected", 403, "PROTECTED");
    }
    yield prisma_1.default.$transaction([
        prisma_1.default.user.update({
            where: { id: userId },
            data: { deleted_at: null, status: "active" },
        }),
        prisma_1.default.deletedAccount.deleteMany({ where: { original_user_id: userId } }),
    ]);
    logger_1.logger.info("User restored by admin", { userId: String(userId) });
    return { id: Number(userId), restored: true };
});
exports.restoreUserByAdmin = restoreUserByAdmin;
/**
 * Irreversible hard delete of an already-archived account. Cascades remove
 * every dependent row; uploaded evidence files are collected first and removed
 * after commit, since blob deletion must not hold a transaction open.
 *
 * `trades.closed_by` is the one User relation in the schema that is NOT
 * onDelete: Cascade - it is Restrict, so a trade this user force-closed would
 * otherwise abort the whole purge with P2003. It is nulled inside the same
 * transaction as the delete, which is safe: an admin that force-closes a trade
 * is acting on a closed record, and the audit trail that matters (the trade
 * itself) survives via the user_id cascade.
 */
const purgeUserByAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = BigInt(id);
    const user = yield prisma_1.default.user.findFirst({
        where: { id: userId, deleted_at: { not: null } },
    });
    if (!user) {
        throw httpError("User not found or not deleted", 404, "NOT_FOUND");
    }
    if (isProtectedAccount(user)) {
        throw httpError("This account is protected and cannot be purged", 403, "PROTECTED");
    }
    const [deposits, kycSubmissions, loans, repayments, attachments, notifications, closedTrades] = yield Promise.all([
        prisma_1.default.deposit.findMany({ where: { user_id: userId }, select: { proof_image: true } }),
        prisma_1.default.kycSubmission.findMany({
            where: { user_id: userId },
            select: { front_image_url: true, back_image_url: true, selfie_image_url: true },
        }),
        prisma_1.default.loan.findMany({ where: { user_id: userId }, select: { front_image: true, back_image: true } }),
        prisma_1.default.loanRepayment.findMany({ where: { processed_by: userId }, select: { proof_image: true } }),
        prisma_1.default.supportTicketMessage.findMany({
            where: { OR: [{ user_id: userId }, { admin_id: userId }] },
            select: { attachments: true },
        }),
        prisma_1.default.notification.findMany({ where: { OR: [{ user_id: userId }, { admin_id: userId }] }, select: { image_url: true } }),
        prisma_1.default.trade.count({ where: { closed_by: userId } }),
    ]);
    const blobs = new Set();
    const add = (value) => {
        if (typeof value === "string" && value.trim()) {
            blobs.add(value.trim());
        }
    };
    for (const row of deposits) add(row.proof_image);
    for (const row of kycSubmissions) {
        add(row.front_image_url);
        add(row.back_image_url);
        add(row.selfie_image_url);
    }
    for (const row of loans) {
        add(row.front_image);
        add(row.back_image);
    }
    for (const row of repayments) add(row.proof_image);
    for (const row of attachments) {
        // Legacy rows store a comma separated list, newer ones a JSON array.
        if (typeof row.attachments === "string") {
            const trimmed = row.attachments.trim();
            if (trimmed.startsWith("[")) {
                try {
                    for (const url of JSON.parse(trimmed)) add(url);
                }
                catch (_error) {
                    for (const url of trimmed.split(",")) add(url);
                }
            }
            else {
                for (const url of trimmed.split(",")) add(url);
            }
        }
    }
    for (const row of notifications) add(row.image_url);
    try {
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Drops the Restrict reference before the row disappears. Not a
            // filter concern: `trade` is not the soft-deleted model.
            yield tx.trade.updateMany({ where: { closed_by: userId }, data: { closed_by: null } });
            yield tx.user.delete({ where: { id: userId } });
            // No FK on original_user_id, so the archive deliberately survives to
            // record that the account was permanently removed.
        }));
    }
    catch (error) {
        if (error && error.code === "P2003") {
            throw httpError("This user has related records that prevent permanent deletion. Resolve them or contact a developer.", 409, "FK_CONSTRAINT");
        }
        throw error;
    }
    // Best effort, after commit, matching deposit.service.js: a failed unlink
    // must not roll back a completed purge.
    let removed = 0;
    for (const url of blobs) {
        try {
            if (yield blob_storage_1.deleteBlobObject(url)) {
                removed += 1;
            }
        }
        catch (error) {
            logger_1.logger.warn("Failed to delete blob during user purge", {
                userId: String(userId),
                url,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    logger_1.logger.info("User permanently purged by admin", {
        userId: String(userId),
        closedTradesDetached: closedTrades,
        blobsRemoved: removed,
        blobsFailed: blobs.size - removed,
    });
    return { id: Number(userId), purged: true, blobsRemoved: removed };
});
exports.purgeUserByAdmin = purgeUserByAdmin;
