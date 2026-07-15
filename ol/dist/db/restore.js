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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const modelsOrdered = [
    "user",
    "arbitrageProduct",
    "miningProduct",
    "profile",
    "asset",
    "cryptoAddress",
    "deposit",
    "withdrawal",
    "kycSubmission",
    "arbitrageHosting",
    "miningHosting",
    "supportTicket",
    "supportTicketMessage",
    "trade",
    "tradeContract",
    "tradeOption",
    "tradeSpot",
    "transaction",
    "personalAccessToken",
    "migration",
    "job",
    "failedJob",
    "jobBatch",
    "cache",
    "cacheLock",
    "passwordResetToken",
    "session",
];
const bigIntFields = new Set([
    "id",
    "user_id",
    "product_id",
    "created_by",
    "updated_by",
    "processed_by",
    "tokenable_id",
    "ticket_id",
    "admin_id",
    "trade_id",
    "closed_by",
]);
const dateFields = new Set([
    "created_at",
    "updated_at",
    "start_date",
    "end_date",
    "last_profit_date",
    "last_updated_at",
    "last_updated",
    "processed_at",
    "failed_at",
    "approved_at",
    "rejected_at",
    "last_used_at",
    "expires_at",
    "last_reply_at",
    "closed_at",
    "opened_at",
    "email_verified_at",
]);
const jsonStringFields = new Set([
    "supported_currencies",
    "kyc_documents",
    "blockchain_addresses",
    "notification_settings",
    "attachments",
    "payload",
    "exception",
    "failed_job_ids",
    "options",
]);
function transformData(modelName, data) {
    return data.map((item) => {
        const newItem = Object.assign({}, item);
        for (const key in newItem) {
            const value = newItem[key];
            if (value === null)
                continue;
            if (bigIntFields.has(key)) {
                // Special case: Migration id is Int
                if (modelName === "migration" && key === "id") {
                    newItem[key] = Number(value);
                }
                else {
                    newItem[key] = BigInt(value);
                }
            }
            else if (dateFields.has(key)) {
                // Special cases for Int timestamps
                if ((modelName === "job" || modelName === "jobBatch") &&
                    (key === "created_at" ||
                        key === "available_at" ||
                        key === "reserved_at" ||
                        key === "cancelled_at" ||
                        key === "finished_at")) {
                    newItem[key] = Number(value);
                }
                else {
                    newItem[key] = new Date(value);
                }
            }
            else if (jsonStringFields.has(key) && typeof value === "object") {
                newItem[key] = JSON.stringify(value);
            }
        }
        return newItem;
    });
}
function RestoreDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs_1.default.readdirSync(process.cwd());
        // Sort by time to get the latest
        const backupFile = files
            .filter((f) => f.startsWith("backup_") && f.endsWith(".json"))
            .sort()
            .pop();
        if (!backupFile) {
            throw new Error("No backup file found");
        }
        console.log(`Restoring from ${backupFile}...`);
        const content = fs_1.default.readFileSync(path_1.default.join(process.cwd(), backupFile), "utf-8");
        const backupData = JSON.parse(content);
        for (const model of modelsOrdered) {
            const data = backupData[model];
            if (!data || data.length === 0) {
                console.log(`Skipping ${model} (no data)`);
                continue;
            }
            console.log(`Restoring ${model} (${data.length} records)...`);
            const transformedData = transformData(model, data);
            const chunkSize = 1000;
            for (let i = 0; i < transformedData.length; i += chunkSize) {
                const chunk = transformedData.slice(i, i + chunkSize);
                try {
                    // @ts-ignore
                    yield prisma_1.default[model].createMany({
                        data: chunk,
                        skipDuplicates: true,
                    });
                }
                catch (e) {
                    console.error(`Failed to insert chunk for ${model}:`, e);
                }
            }
        }
        console.log("Restoration completed.");
        // Reset sequences
        console.log("Resetting sequences...");
        const tableMap = {
            user: "users",
            arbitrageHosting: "arbitrage_hostings",
            arbitrageProduct: "arbitrage_products",
            asset: "assets",
            cache: "cache",
            cacheLock: "cache_locks",
            cryptoAddress: "crypto_addresses",
            deposit: "deposits",
            failedJob: "failed_jobs",
            jobBatch: "job_batches",
            job: "jobs",
            kycSubmission: "kyc_submissions",
            migration: "migrations",
            miningHosting: "mining_hostings",
            miningProduct: "mining_products",
            passwordResetToken: "password_reset_tokens",
            personalAccessToken: "personal_access_tokens",
            profile: "profiles",
            session: "sessions",
            supportTicketMessage: "support_ticket_messages",
            supportTicket: "support_tickets",
            tradeContract: "trade_contracts",
            tradeOption: "trade_options",
            tradeSpot: "trade_spots",
            trade: "trades",
            transaction: "transactions",
            withdrawal: "withdrawals",
        };
        for (const model of modelsOrdered) {
            const tableName = tableMap[model];
            if (!tableName)
                continue;
            try {
                // Only for tables with BigInt/Int id
                if (model === "passwordResetToken" ||
                    model === "session" ||
                    model === "jobBatch" ||
                    model === "cache" ||
                    model === "cacheLock")
                    continue;
                yield prisma_1.default.$queryRawUnsafe(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE(max(id), 1)) FROM "${tableName}";`);
            }
            catch (e) {
                // console.warn(`Could not reset sequence for ${tableName}`);
            }
        }
        const hashedPassword = yield bcryptjs_1.default.hash("password#123", 10);
        yield prisma_1.default.user.upsert({
            where: { email: "admin@robintradepremium.com" },
            update: {
                password: hashedPassword,
            },
            create: {
                name: "Admin User",
                email: "admin@robintradepremium.com",
                password: hashedPassword,
                role: "admin",
            },
        });
        yield prisma_1.default.user.upsert({
            where: { email: "superadmin@robintradepremium.com" },
            update: {
                password: hashedPassword,
            },
            create: {
                name: "Super Admin User",
                email: "superadmin@robintradepremium.com",
                password: hashedPassword,
                role: "admin",
            },
        });
        console.log("Sequences reset.");
    });
}
RestoreDatabase()
    .catch((error) => {
    console.error("Restoration failed:", error);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.$disconnect();
}));
