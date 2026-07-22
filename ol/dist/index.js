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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// import { responseFormatter } from "./middleware/http-response.middleware";
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const user_routes_1 = __importDefault(require("./user/user.routes"));
const arbitrage_routes_1 = __importDefault(require("./arbitrage/arbitrage.routes"));
const mining_routes_1 = __importDefault(require("./mining/mining.routes"));
const admin_1 = __importDefault(require("./admin"));
const transaction_routes_1 = __importDefault(require("./transaction/transaction.routes"));
const deposit_routes_1 = __importDefault(require("./deposit/deposit.routes"));
const trade_routes_1 = __importDefault(require("./trade/trade.routes"));
const trade_admin_routes_1 = __importDefault(require("./trade/trade.admin.routes"));
const asset_routes_1 = __importDefault(require("./asset/asset.routes"));
const support_ticket_routes_1 = __importDefault(require("./support/support-ticket.routes"));
const profile_routes_1 = __importDefault(require("./profile/profile.routes"));
const kyc_submission_routes_1 = __importDefault(require("./kyc/kyc-submission.routes"));
const market_routes_1 = __importDefault(require("./market/market.routes"));
const withdrawal_routes_1 = __importDefault(require("./withdrawal/withdrawal.routes"));
const loan_routes_1 = __importDefault(require("./loan/loan.routes"));
const loan_admin_routes_1 = __importDefault(require("./loan/loan.admin.routes"));
const notification_routes_1 = __importDefault(require("./notification/notification.routes"));
const news_routes_1 = __importDefault(require("./news/news.routes"));
const onboarding_routes_1 = __importDefault(require("./onboarding/onboarding.routes"));
const referral_routes_1 = __importDefault(require("./referral/referral.routes"));
const transfer_routes_1 = __importDefault(require("./transfer/transfer.routes"));
const load_routes_1 = __importDefault(require("./transfer/load.routes"));
const blob_upload_route_1 = __importDefault(require("./utils/blob-upload-route"));
const multer_1 = __importDefault(require("multer"));
const prisma_1 = __importDefault(require("./prisma"));
const request_logger_middleware_1 = require("./middleware/request-logger.middleware");
const error_handler_middleware_1 = require("./middleware/error-handler.middleware");
const logger_1 = require("./utils/logger");
const rateLimit = require("express-rate-limit");
const loan_scheduler_1 = require("./loan/jobs/loan.scheduler");
const app = (0, express_1.default)();
const port = 4000;
const defaultAllowedOrigins = ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",").filter((origin) => Boolean(origin))) || [];
console.log("Allowed Origins:", defaultAllowedOrigins);
const corsOptions = {
    origin: defaultAllowedOrigins.length > 0 ? defaultAllowedOrigins : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection",
    ],
};
app.use((0, cors_1.default)(corsOptions));
// app.options("*", cors(corsOptions));
app.set("etag", false);
app.use((req, res, next) => {
    if (req.method === "GET" && /^\/api\/profile\/with-user-data/.test(req.path)) {
        res.setHeader("Cache-Control", "private, max-age=30");
    } else {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    }
    next();
});
const formDataParser = (0, multer_1.default)();
// Skip the global "text-only" multipart parser for routes that accept file uploads.
const multipartBypassPatterns = [
    /^\/api\/support-tickets/,
    /^\/api\/deposit/,
    /^\/api\/deposits/,
    /^\/api\/loans/,
    /^\/api\/admin\/users\/\d+\/notifications/,
    /^\/api\/kyc-submissions/,
    /^\/api\/blob/,
];
app.use((req, res, next) => {
    var _a;
    const contentType = (_a = req.headers["content-type"]) !== null && _a !== void 0 ? _a : "";
    if (!contentType.includes("multipart/form-data")) {
        return next();
    }
    if (multipartBypassPatterns.some((pattern) => pattern.test(req.path))) {
        return next();
    }
    return formDataParser.none()(req, res, next);
});
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
app.use(express_1.default.json({ limit: "1mb" }));
// app.use(responseFormatter);
app.use(request_logger_middleware_1.requestLogger);
// Add this to the entry point of your application
// @ts-ignore
BigInt.prototype.toJSON = function () {
    return Number(this.toString());
};
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "My API Information",
        },
        // servers: [
        //   {
        //     url: `http://localhost:${port}`,
        //   },
        //   {
        //     url: `https://robinhoods-backend.vercel.app`,
        //   },
        //   {
        //     url: `https://node-backend.robintokentrade.com`,
        //   },
        // ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/*/*routes.ts"],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
const authRateLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: "Too many requests, please try again later" });
const kycRateLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: "Too many KYC submissions, please try again later" });
app.use("/api/register", authRateLimiter);
app.use("/api/login", authRateLimiter);
app.use("/api/forgot-password", authRateLimiter);
app.use("/api/kyc-submissions", (req, res, next) => { if (req.method === "POST") return kycRateLimiter(req, res, next); next(); });
app.use("/api", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/arbitrage", arbitrage_routes_1.default);
app.use("/api/mining", mining_routes_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/transactions", transaction_routes_1.default);
app.use("/api/deposit", deposit_routes_1.default);
app.use("/api/deposits", deposit_routes_1.default);
app.use("/api/trades", trade_routes_1.default);
app.use("/api/admin/trades", trade_admin_routes_1.default);
app.use("/api/assets", asset_routes_1.default);
app.use("/api/support-tickets", support_ticket_routes_1.default);
app.use("/api/profile", profile_routes_1.default);
app.use("/api/kyc-submissions", kyc_submission_routes_1.default);
app.use("/api/market", market_routes_1.default);
app.use("/api/withdrawals", withdrawal_routes_1.default);
app.use("/api/loans", loan_routes_1.default);
app.use("/api/admin/loans", loan_admin_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/news", news_routes_1.default);
app.use("/api/onboarding", onboarding_routes_1.default);
app.use("/api/referral", referral_routes_1.default);
app.use("/api/transfer", transfer_routes_1.default);
app.use("/api/trading-balance", load_routes_1.default);
app.use("/api/transfer", load_routes_1.default);
app.use("/api/blob", blob_upload_route_1.default);
app.use(error_handler_middleware_1.errorHandler);
const loanScheduler = new loan_scheduler_1.LoanScheduler();
loanScheduler.start();
app.listen(port, () => {
    logger_1.logger.info("Server started", {
        port,
        docs: `http://localhost:${port}/api-docs`,
    });
});
process.on("beforeExit", () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.$disconnect();
}));
process.on("unhandledRejection", (err) => {
    logger_1.logger.error("Unhandled promise rejection", err);
});
process.on("uncaughtException", (err) => {
    logger_1.logger.error("Uncaught exception", err);
    process.exit(1);
});
