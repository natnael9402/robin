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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../generated/prisma");
const prisma_2 = __importDefault(require("../prisma"));
const miningProducts = [
    {
        name: "S3",
        days: 30,
        daily_rate: new prisma_1.Prisma.Decimal("1.88"),
        min_amount: new prisma_1.Prisma.Decimal("50000"),
        max_amount: new prisma_1.Prisma.Decimal("100001"),
        limit_times: 3,
        hashrate: "850W+12%",
        power: "210W",
        network_type: "ETH",
        manufacturer: "Intel",
        size: "360x125x155mm",
        weight: "8.2KG",
        temperature: "0~45C",
        humidity: "-20~75",
        image: "/s3.jpg",
        is_active: true,
    },
    {
        name: "MS3",
        days: 40,
        daily_rate: new prisma_1.Prisma.Decimal("1.90"),
        min_amount: new prisma_1.Prisma.Decimal("200000"),
        max_amount: new prisma_1.Prisma.Decimal("400000"),
        limit_times: 3,
        hashrate: "8300+/-10%",
        power: "3188+/-10%",
        network_type: "ETH",
        manufacturer: "Intel",
        size: "570x316x430mm",
        weight: "1700kg",
        temperature: "0~45C",
        humidity: "3%RH-115%RH",
        image: "/ms3.jpg",
        is_active: true,
    },
    {
        name: "460S",
        days: 45,
        daily_rate: new prisma_1.Prisma.Decimal("2.00"),
        min_amount: new prisma_1.Prisma.Decimal("1000000"),
        max_amount: new prisma_1.Prisma.Decimal("3000000"),
        limit_times: 1,
        hashrate: "500TH/S +/-5%",
        power: "34000W +/-10%",
        network_type: "ETH",
        manufacturer: "Bitmain",
        size: "550x320x200mm",
        weight: "14.5KG",
        temperature: "0~40C",
        humidity: "5%RH~95%RH",
        image: "/460s.jpg",
        is_active: true,
    },
];
const arbitrageProducts = [
    {
        name: "A100",
        days: 1,
        daily_rate: new prisma_1.Prisma.Decimal("0.50"),
        min_amount: new prisma_1.Prisma.Decimal("1000"),
        max_amount: new prisma_1.Prisma.Decimal("2999"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "H200",
        days: 3,
        daily_rate: new prisma_1.Prisma.Decimal("0.87"),
        min_amount: new prisma_1.Prisma.Decimal("3000"),
        max_amount: new prisma_1.Prisma.Decimal("7999"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "GH350",
        days: 7,
        daily_rate: new prisma_1.Prisma.Decimal("0.99"),
        min_amount: new prisma_1.Prisma.Decimal("8000"),
        max_amount: new prisma_1.Prisma.Decimal("19999"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "V1",
        days: 7,
        daily_rate: new prisma_1.Prisma.Decimal("1.20"),
        min_amount: new prisma_1.Prisma.Decimal("20000"),
        max_amount: new prisma_1.Prisma.Decimal("50001"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "V8",
        days: 14,
        daily_rate: new prisma_1.Prisma.Decimal("1.41"),
        min_amount: new prisma_1.Prisma.Decimal("50000"),
        max_amount: new prisma_1.Prisma.Decimal("99999"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "V12",
        days: 15,
        daily_rate: new prisma_1.Prisma.Decimal("1.56"),
        min_amount: new prisma_1.Prisma.Decimal("100000"),
        max_amount: new prisma_1.Prisma.Decimal("200000"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "V16",
        days: 20,
        daily_rate: new prisma_1.Prisma.Decimal("1.62"),
        min_amount: new prisma_1.Prisma.Decimal("200000"),
        max_amount: new prisma_1.Prisma.Decimal("300000"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "A360",
        days: 20,
        daily_rate: new prisma_1.Prisma.Decimal("1.76"),
        min_amount: new prisma_1.Prisma.Decimal("300000"),
        max_amount: new prisma_1.Prisma.Decimal("500000"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "A3487",
        days: 26,
        daily_rate: new prisma_1.Prisma.Decimal("1.86"),
        min_amount: new prisma_1.Prisma.Decimal("500000"),
        max_amount: new prisma_1.Prisma.Decimal("999999"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
    {
        name: "A3679",
        days: 35,
        daily_rate: new prisma_1.Prisma.Decimal("3.10"),
        min_amount: new prisma_1.Prisma.Decimal("1000000"),
        max_amount: new prisma_1.Prisma.Decimal("3000000"),
        image: "/avatar.jpg",
        is_active: true,
        supported_currencies: JSON.stringify(["USDT", "BTC", "ETH"]),
    },
];
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Seeding database...");
        // console.log("🔄 Migrating database...");
        // execSync("npx prisma migrate deploy", { stdio: "inherit" });
        // console.log("🚀 Migration complete, starting server...");
        const [existingArbitrage, existingMining] = yield Promise.all([
            prisma_2.default.arbitrageProduct.count(),
            prisma_2.default.miningProduct.count(),
        ]);
        if (existingArbitrage > 0 && existingMining > 0) {
            console.log("Seed data already present (arbitrage & mining products found). Skipping.");
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash("password#123", 10);
        yield prisma_2.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            yield tx.arbitrageHosting.deleteMany();
            yield tx.miningHosting.deleteMany();
            yield tx.miningProduct.deleteMany();
            yield tx.arbitrageProduct.deleteMany();
            yield tx.user.upsert({
                where: { email: "bruk@upholdtrading.com" },
                update: {
                    name: "Test User",
                    password: hashedPassword,
                },
                create: {
                    name: "Test User",
                    email: "bruk@upholdtrading.com",
                    password: hashedPassword,
                },
            });
            yield tx.user.upsert({
                where: { email: "superadmin@upholdtrading.com" },
                update: {
                    name: "Super Admin User",
                    role: "admin",
                    password: hashedPassword,
                },
                create: {
                    name: "Super Admin User",
                    email: "superadmin@upholdtrading.com",
                    role: "admin",
                    password: hashedPassword,
                },
            });
            yield tx.user.upsert({
                where: { email: "admin@upholdtrading.com" },
                update: {
                    name: "Admin User",
                    role: "admin",
                    password: hashedPassword,
                },
                create: {
                    name: "Admin User",
                    email: "admin@upholdtrading.com",
                    role: "admin",
                    password: hashedPassword,
                },
            });
            for (const product of miningProducts) {
                yield tx.miningProduct.create({ data: product });
            }
            for (const product of arbitrageProducts) {
                yield tx.arbitrageProduct.create({ data: product });
            }
        }));
        console.log("Database seeded successfully.");
    });
}
seed()
    .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_2.default.$disconnect();
}));
