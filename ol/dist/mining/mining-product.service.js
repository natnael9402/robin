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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAdminProducts = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningProduct.findMany({
        where: { is_active: true },
    });
});
exports.getProducts = getProducts;
const getAdminProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningProduct.findMany();
});
exports.getAdminProducts = getAdminProducts;
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningProduct.findUnique({
        where: { id },
    });
});
exports.getProductById = getProductById;
const createProduct = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningProduct.create({
        data,
    });
});
exports.createProduct = createProduct;
const updateProduct = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.miningProduct.update({
        where: { id },
        data,
    });
});
exports.updateProduct = updateProduct;
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check for active hostings
    const activeHostings = yield prisma_1.default.miningHosting.count({
        where: {
            product_id: id,
            status: "running",
        },
    });
    if (activeHostings > 0) {
        throw new Error("Cannot delete a product with active hostings");
    }
    return prisma_1.default.miningProduct.delete({
        where: { id },
    });
});
exports.deleteProduct = deleteProduct;
