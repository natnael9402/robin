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
exports.deleteHosting = exports.updateHostingStatus = exports.processHostingProfits = exports.getHosting = exports.listHostings = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const arbitrage_product_service_1 = require("./arbitrage-product.service");
const arbitrage_hosting_service_1 = require("./arbitrage-hosting.service");
const productService = new arbitrage_product_service_1.ArbitrageProductService();
const hostingService = new arbitrage_hosting_service_1.ArbitrageHostingService();
const listProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield productService.findAllProducts();
        res.json({
            success: true,
            message: "Arbitrage products retrieved successfully",
            data: products,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve arbitrage products",
            error: error.message,
        });
    }
});
exports.listProducts = listProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = yield productService.findProductById(productId);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Arbitrage product not found" });
        }
        res.json({
            success: true,
            message: "Arbitrage product retrieved successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve arbitrage product",
            error: error.message,
        });
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: "Arbitrage product created successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create arbitrage product",
            error: error.message,
        });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = yield productService.updateProduct(productId, req.body);
        res.json({
            success: true,
            message: "Arbitrage product updated successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update arbitrage product",
            error: error.message,
        });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = parseInt(req.params.id, 10);
        yield productService.deleteProduct(productId);
        res.json({
            success: true,
            message: "Arbitrage product deleted successfully",
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Cannot delete a product with active hostings") {
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete arbitrage product",
            error: message,
        });
    }
});
exports.deleteProduct = deleteProduct;
const listHostings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostings = yield hostingService.findAllHostings(req.query);
        res.json({
            success: true,
            message: "Arbitrage hostings retrieved successfully",
            data: hostings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve arbitrage hostings",
            error: error.message,
        });
    }
});
exports.listHostings = listHostings;
const getHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        const hosting = yield hostingService.findHostingById(hostingId);
        if (!hosting) {
            return res
                .status(404)
                .json({ success: false, message: "Arbitrage hosting not found" });
        }
        res.json({
            success: true,
            message: "Arbitrage hosting retrieved successfully",
            data: hosting,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve arbitrage hosting",
            error: error.message,
        });
    }
});
exports.getHosting = getHosting;
const processHostingProfits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        const result = yield hostingService.processPendingProfitsAdmin(hostingId);
        res.json({
            success: true,
            message: "Arbitrage hosting profits processed successfully",
            data: result,
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Hosting not found") {
            return res.status(404).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to process arbitrage hosting profits",
            error: message,
        });
    }
});
exports.processHostingProfits = processHostingProfits;
const updateHostingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        const { status } = req.body;
        const updated = yield hostingService.updateHostingStatusAdmin(hostingId, status);
        res.json({
            success: true,
            message: "Arbitrage hosting status updated successfully",
            data: updated,
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Hosting not found") {
            return res.status(404).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to update arbitrage hosting status",
            error: message,
        });
    }
});
exports.updateHostingStatus = updateHostingStatus;
const deleteHosting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostingId = parseInt(req.params.id, 10);
        const deleted = yield hostingService.deleteHosting(hostingId);
        if (!deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Arbitrage hosting not found" });
        }
        res.json({
            success: true,
            message: "Arbitrage hosting deleted successfully",
        });
    }
    catch (error) {
        const message = error.message;
        if (message === "Cannot delete a running hosting") {
            return res.status(400).json({ success: false, message });
        }
        res.status(500).json({
            success: false,
            message: "Failed to delete arbitrage hosting",
            error: message,
        });
    }
});
exports.deleteHosting = deleteHosting;
