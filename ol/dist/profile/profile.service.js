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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = __importDefault(require("../prisma"));
const asset_service_1 = __importDefault(require("../asset/asset.service"));
const prisma_2 = require("../generated/prisma");
const logger_1 = require("../utils/logger");
const profileCache = new Map();
const PROFILE_CACHE_TTL = 30000;
const snakeToCamel = (key) => key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
const camelizeKeys = (obj) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [snakeToCamel(key), value]));
const MAX_PROFILE_LEVEL = 3;
const parseJsonField = (value) => {
    if (!value) {
        return null;
    }
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
            return parsed;
        }
        return null;
    }
    catch (error) {
        return null;
    }
};
const sanitizeUserSummary = (user) => {
    if (!user) {
        return undefined;
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
};
const formatProfile = (profile) => {
    return Object.assign(Object.assign({}, profile), { kyc_documents: parseJsonField(profile.kyc_documents) });
    const { withdrawal_password, google_auth_secret, kyc_documents, blockchain_addresses, notification_settings, user } = profile, rest = __rest(profile, ["withdrawal_password", "google_auth_secret", "kyc_documents", "blockchain_addresses", "notification_settings", "user"]);
    const camelizedRest = camelizeKeys(rest);
    return Object.assign(Object.assign({}, camelizedRest), { user: sanitizeUserSummary(user), kycDocuments: parseJsonField(kyc_documents), blockchainAddresses: parseJsonField(blockchain_addresses), notificationSettings: parseJsonField(notification_settings), withdrawalPassword: undefined, googleAuthSecret: undefined });
};
const serializeJsonField = (value) => {
    if (typeof value === "undefined") {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return JSON.stringify(value);
};
const getLevelTier = (level) => {
    switch (level) {
        case 1:
            return "Bronze";
        case 2:
            return "Silver";
        case 3:
            return "Gold";
        default:
            return "Bronze";
    }
};
class ProfileService {
    constructor(assets = asset_service_1.default) {
        this.assets = assets;
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
                include: { user: true },
            });
            if (!profile) {
                return null;
            }
            return formatProfile(profile);
        });
    }
    updateUserProfile(userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
            });
            if (!profile) {
                throw new Error("Profile not found");
            }
            const data = {};
            if (Object.prototype.hasOwnProperty.call(input, "preferredLanguage")) {
                data.preferred_language =
                    typeof input.preferredLanguage === "string"
                        ? input.preferredLanguage
                        : undefined;
            }
            if (Object.prototype.hasOwnProperty.call(input, "bankAccount")) {
                data.bank_account =
                    typeof input.bankAccount === "string" || input.bankAccount === null
                        ? input.bankAccount
                        : undefined;
            }
            if (Object.prototype.hasOwnProperty.call(input, "blockchainAddresses")) {
                data.blockchain_addresses = serializeJsonField(input.blockchainAddresses);
            }
            if (Object.prototype.hasOwnProperty.call(input, "notificationSettings")) {
                data.notification_settings = serializeJsonField(input.notificationSettings);
            }
            if (Object.prototype.hasOwnProperty.call(input, "simTradeEnabled")) {
                data.sim_trade_enabled = (_a = input.simTradeEnabled) !== null && _a !== void 0 ? _a : undefined;
            }
            const updated = yield prisma_1.default.profile.update({
                where: { id: profile.id },
                data,
                include: { user: true },
            });
            return formatProfile(updated);
        });
    }
    enableGoogleAuth(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
            });
            if (!profile) {
                throw new Error("Profile not found");
            }
            const secret = crypto_1.default.randomBytes(16).toString("hex");
            yield prisma_1.default.profile.update({
                where: { id: profile.id },
                data: {
                    google_auth_enabled: true,
                    google_auth_secret: secret,
                },
            });
            return {
                googleAuthEnabled: true,
                googleAuthSecret: secret,
            };
        });
    }
    upgradeLevel(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield prisma_1.default.profile.findFirst({
                where: { user_id: userId },
            });
            if (!profile) {
                throw new Error("Profile not found");
            }
            if (profile.level >= MAX_PROFILE_LEVEL) {
                const error = new Error("Already at maximum level");
                error.code = "MAX_LEVEL";
                throw error;
            }
            if (profile.kyc_status !== prisma_2.ProfileKycStatus.verified) {
                const error = new Error("KYC verification required for level upgrade");
                error.code = "KYC_REQUIRED";
                throw error;
            }
            const updated = yield prisma_1.default.profile.update({
                where: { id: profile.id },
                data: { level: profile.level + 1 },
                include: { user: true },
            });
            return {
                level: updated.level,
                tier: getLevelTier(updated.level),
                profile: formatProfile(updated),
            };
        });
    }
    getProfileWithUserData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const cached = profileCache.get(userId);
            if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL) {
                return cached.data;
            }
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                include: { profiles: true },
            });
            if (!user)
                throw new Error("User not found");
            const profile = user.profiles[0];
            if (!profile)
                throw new Error("Profile not found");
            const [assets, assetsValue] = yield Promise.all([
                this.assets.getUserAssets(userId),
                this.assets.getTotalAssetValue(userId),
            ]);
            const accountBalances = yield prisma_1.default.accountBalance.findMany({ where: { user_id: BigInt(userId) } });
            const balance = accountBalances.reduce((sum, ab) => sum.add(new library_1.Decimal(ab.balance.toString())), new library_1.Decimal("0"));
            const totalAssetsValue = balance.add(assetsValue);
            const currentTotalAssets = new library_1.Decimal((_d = (_c = profile.total_assets) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : "0");
            const needsUpdate = !currentTotalAssets.eq(totalAssetsValue);
            if (needsUpdate) {
                prisma_1.default.profile
                    .update({
                    where: { id: profile.id },
                    data: { total_assets: totalAssetsValue },
                })
                    .then(() => {
                    logger_1.logger.info("total_assets updated asynchronously", {
                        profileId: profile.id,
                        userId,
                    });
                })
                    .catch((error) => {
                    const message = error instanceof Error ? error.message : "Unknown error";
                    if (message.includes("Lock wait timeout exceeded")) {
                        logger_1.logger.warn("Skipped total_assets update due to lock timeout", {
                            profileId: profile.id,
                            userId,
                            error: message,
                        });
                    }
                    else {
                        logger_1.logger.error("Error updating profile asynchronously", {
                            profileId: profile.id,
                            userId,
                            error: message,
                        });
                    }
                });
            }
            const result = {
                profile: formatProfile(profile),
                balance,
                assets,
                assetsValue,
                totalAssetsValue,
                user: sanitizeUserSummary(user),
            };
            profileCache.set(userId, { data: result, ts: Date.now() });
            return result;
        });
    }
}
exports.ProfileService = ProfileService;
exports.default = new ProfileService();
