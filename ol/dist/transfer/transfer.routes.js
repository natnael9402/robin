"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfer_controller_1 = require("./transfer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const transferController = new transfer_controller_1.TransferController();
router.post("/", auth_middleware_1.authenticateJWT, transferController.transfer);
exports.default = router;
