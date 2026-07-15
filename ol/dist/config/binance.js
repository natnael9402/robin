"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const node_binance_api_1 = __importDefault(require("node-binance-api"));
const logger_1 = require("../utils/logger");
const binance = new node_binance_api_1.default();
const useServerTimeEnv = process.env.BINANCE_USE_SERVER_TIME;
const useServerTime = useServerTimeEnv ? useServerTimeEnv === "true" : false;
try {
    binance.options({
        APIKEY: process.env.BINANCE_API_KEY || "",
        APISECRET: process.env.BINANCE_API_SECRET || "",
        useServerTime,
        reconnect: false,
        recvWindow: 60000,
    });
}
catch (error) {
    logger_1.logger.error("Failed to initialize Binance client", error);
}
exports.default = binance;
