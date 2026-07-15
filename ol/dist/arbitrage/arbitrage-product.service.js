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
exports.ArbitrageProductService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ArbitrageProductService {
    findAllActiveProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageProduct.findMany({
                where: { is_active: true },
            });
        });
    }
    findAllProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageProduct.findMany();
        });
    }
    findProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageProduct.findUnique({
                where: { id },
            });
        });
    }
    createProduct(productData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageProduct.create({
                data: productData,
            });
        });
    }
    updateProduct(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.arbitrageProduct.update({
                where: { id },
                data: updateData,
            });
        });
    }
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeHostings = yield prisma_1.default.arbitrageHosting.count({
                where: {
                    product_id: id,
                    status: "running",
                },
            });
            if (activeHostings > 0) {
                throw new Error("Cannot delete a product with active hostings");
            }
            const result = yield prisma_1.default.arbitrageProduct.delete({ where: { id } });
            return !!result;
        });
    }
}
exports.ArbitrageProductService = ArbitrageProductService;
