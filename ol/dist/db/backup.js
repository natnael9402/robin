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
const prisma_1 = __importDefault(require("../prisma"));
const models = [
    "arbitrageHosting",
    "arbitrageProduct",
    "asset",
    "cache",
    "cacheLock",
    "cryptoAddress",
    "deposit",
    "failedJob",
    "jobBatch",
    "job",
    "kycSubmission",
    "migration",
    "miningHosting",
    "miningProduct",
    "passwordResetToken",
    "personalAccessToken",
    "profile",
    "session",
    "supportTicketMessage",
    "supportTicket",
    "tradeContract",
    "tradeOption",
    "tradeSpot",
    "trade",
    "transaction",
    "user",
    "withdrawal",
];
function BackUpDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const backupData = {};
        console.log("Starting backup...");
        for (const model of models) {
            try {
                console.log(`Backing up ${model}...`);
                // @ts-ignore
                const data = yield prisma_1.default[model].findMany();
                backupData[model] = data;
                console.log(`Backed up ${data.length} records from ${model}`);
            }
            catch (error) {
                console.error(`Error backing up ${model}:`, error);
            }
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `backup_${timestamp}.json`;
        const filePath = path_1.default.join(process.cwd(), filename);
        const jsonString = JSON.stringify(backupData, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2);
        fs_1.default.writeFileSync(filePath, jsonString);
        console.log(`Backup completed successfully. Saved to ${filePath}`);
    });
}
BackUpDatabase()
    .catch((error) => {
    console.error("Failed to backup database:", error);
    process.exitCode = 1;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.$disconnect();
}));
