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
exports.getDepositAddress = exports.getDepositAddresses = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getDepositAddresses = () => __awaiter(void 0, void 0, void 0, function* () {
    const addresses = yield prisma_1.default.cryptoAddress.findMany({
        where: { is_active: true },
        orderBy: { currency: "asc" },
    });
    const groupedAddresses = addresses.reduce((acc, address) => {
        const { currency, network, address: addr, qr_code, notes } = address;
        if (!acc[currency]) {
            acc[currency] = {};
        }
        acc[currency][network] = {
            address: addr,
            network,
            qrCode: qr_code,
            currency,
            notes,
        };
        return acc;
    }, {});
    return groupedAddresses;
});
exports.getDepositAddresses = getDepositAddresses;
const getDepositAddress = (currency, network) => __awaiter(void 0, void 0, void 0, function* () {
    const where = {
        currency: currency.toUpperCase(),
        is_active: true,
    };
    if (network) {
        where.network = network.toUpperCase();
    }
    return prisma_1.default.cryptoAddress.findFirst({ where });
});
exports.getDepositAddress = getDepositAddress;
