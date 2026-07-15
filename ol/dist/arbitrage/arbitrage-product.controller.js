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
exports.ArbitrageProductController = void 0;
const arbitrage_product_service_1 = require("./arbitrage-product.service");
const logger_1 = require("../utils/logger");
class ArbitrageProductController {
    constructor() {
        this.productService = new arbitrage_product_service_1.ArbitrageProductService();
        this.getActiveProducts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield this.productService.findAllActiveProducts();
                res.json({
                    success: true,
                    message: "Arbitrage products retrieved successfully",
                    data: products,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage products", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.getAllProducts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield this.productService.findAllProducts();
                res.json({
                    success: true,
                    message: "All arbitrage products retrieved successfully",
                    data: products,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage products", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.getProductById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const productId = parseInt(req.params.id);
                const product = yield this.productService.findProductById(productId);
                if (!product) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage product not found",
                    });
                    return;
                }
                if (!product.is_active) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage product is not available",
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: "Arbitrage product retrieved successfully",
                    data: product,
                });
            }
            catch (error) {
                logger_1.logger.error("Error fetching arbitrage product", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.createProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const productData = req.body;
                const product = yield this.productService.createProduct(productData);
                res.status(201).json({
                    success: true,
                    message: "Arbitrage product created successfully",
                    data: product,
                });
            }
            catch (error) {
                logger_1.logger.error("Error creating arbitrage product", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.updateProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const productId = parseInt(req.params.id);
                const updateData = req.body;
                const product = yield this.productService.updateProduct(productId, updateData);
                if (!product) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage product not found",
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: "Arbitrage product updated successfully",
                    data: product,
                });
            }
            catch (error) {
                logger_1.logger.error("Error updating arbitrage product", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
        this.deleteProduct = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const productId = parseInt(req.params.id);
                const deleted = yield this.productService.deleteProduct(productId);
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        message: "Arbitrage product not found",
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: "Arbitrage product deleted successfully",
                });
            }
            catch (error) {
                logger_1.logger.error("Error deleting arbitrage product", error);
                if (error.message.includes("active hostings")) {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Server error",
                });
            }
        });
    }
}
exports.ArbitrageProductController = ArbitrageProductController;
