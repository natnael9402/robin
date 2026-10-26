"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.publishToUser = publishToUser;
exports.getStats = getStats;
const jwt = require("jsonwebtoken");
const prisma = require("../prisma").default;
const { logger } = require("../utils/logger");

const SOCKET_PATH = "/ws/trades";
const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const RECENT_CLOSED_WINDOW_MS = 10 * 60 * 1000;
const CLOSE_CODE_UNAUTHORIZED = 4001;

let wss = null;
let heartbeatTimer = null;
let evaluateContract = null;
/** userId (string) -> Set<WebSocket> */
const clients = new Map();

function serialize(value) {
    return JSON.parse(JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item)));
}

function compactTrade(trade) {
    if (!trade) {
        return null;
    }
    return serialize({
        id: trade.id,
        type: trade.type,
        symbol: trade.symbol,
        direction: trade.direction,
        amount: trade.amount,
        leverage: trade.leverage,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        status: trade.status,
        result: trade.result,
        pnl: trade.pnl,
        opened_at: trade.opened_at,
        closed_at: trade.closed_at,
        market_type: trade.market_type,
    });
}

function send(socket, payload) {
    if (!socket || socket.readyState !== 1) {
        return false;
    }
    try {
        socket.send(JSON.stringify(payload));
        return true;
    }
    catch (error) {
        logger.warn("Trade socket send failed", {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

function authenticate(request) {
    try {
        if (!process.env.JWT_SECRET) {
            return null;
        }
        const url = new URL(request.url || "/", "http://localhost");
        const token = url.searchParams.get("token");
        if (!token) {
            return null;
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload && (payload.id !== undefined && payload.id !== null ? payload.id : payload.userId);
        if (userId === undefined || userId === null || userId === "") {
            return null;
        }
        return String(userId);
    }
    catch (error) {
        return null;
    }
}

function register(userId, socket) {
    let sockets = clients.get(userId);
    if (!sockets) {
        sockets = new Set();
        clients.set(userId, sockets);
    }
    sockets.add(socket);
    return sockets.size;
}

function unregister(userId, socket) {
    const sockets = clients.get(userId);
    if (!sockets) {
        return 0;
    }
    sockets.delete(socket);
    if (sockets.size === 0) {
        clients.delete(userId);
        return 0;
    }
    return sockets.size;
}

async function sendSnapshot(socket, userId) {
    try {
        const [openTrades, recentClosed] = await Promise.all([
            prisma.trade.findMany({
                where: { user_id: BigInt(userId), type: "contract", status: "open" },
                orderBy: { id: "desc" },
                take: 20,
            }),
            prisma.trade.findMany({
                where: {
                    user_id: BigInt(userId),
                    type: "contract",
                    status: "closed",
                    closed_at: { gte: new Date(Date.now() - RECENT_CLOSED_WINDOW_MS) },
                },
                orderBy: { id: "desc" },
                take: 10,
            }),
        ]);
        send(socket, {
            type: "trade:snapshot",
            serverTime: new Date().toISOString(),
            trades: openTrades.map(compactTrade),
            recentClosed: recentClosed.map(compactTrade),
        });
    }
    catch (error) {
        logger.warn("Trade socket snapshot failed", {
            userId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * "When the user exits it closes": on an explicit exit signal (or the last
 * socket of a user going away) immediately evaluate the user's open
 * contracts. Evaluation only resolves a contract that has actually reached
 * its expiry (or hit TP/SL) — it never force-closes early.
 */
async function flushUserContracts(userId) {
    if (typeof evaluateContract !== "function") {
        return;
    }
    try {
        const openTrades = await prisma.trade.findMany({
            where: { user_id: BigInt(userId), type: "contract", status: "open" },
            select: { id: true },
            orderBy: { id: "asc" },
            take: 25,
        });
        if (openTrades.length === 0) {
            return;
        }
        logger.info("Trade socket exit flush", {
            userId,
            openContracts: openTrades.length,
            tradeIds: openTrades.map((trade) => trade.id.toString()).join(","),
        });
        for (const trade of openTrades) {
            Promise.resolve()
                .then(() => evaluateContract(trade.id))
                .catch((error) => {
                    logger.warn("Trade socket exit evaluation failed", {
                        tradeId: trade.id.toString(),
                        error: error instanceof Error ? error.message : String(error),
                    });
                });
        }
    }
    catch (error) {
        logger.warn("Trade socket exit flush failed", {
            userId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

function publishToUser(userId, payload) {
    const sockets = clients.get(String(userId));
    if (!sockets || sockets.size === 0) {
        return 0;
    }
    const data = JSON.stringify(serialize(payload));
    let delivered = 0;
    for (const socket of sockets) {
        if (socket.readyState !== 1) {
            continue;
        }
        try {
            socket.send(data);
            delivered += 1;
        }
        catch (error) {
            logger.warn("Trade socket publish failed", {
                userId: String(userId),
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return delivered;
}

function getStats() {
    let connections = 0;
    for (const sockets of clients.values()) {
        connections += sockets.size;
    }
    return {
        ready: Boolean(wss),
        path: SOCKET_PATH,
        connections,
        users: clients.size,
    };
}

function init(httpServer, options = {}) {
    if (wss) {
        return wss;
    }
    evaluateContract = typeof options.evaluateContract === "function" ? options.evaluateContract : null;
    let WebSocketServer;
    try {
        const wsModule = require("ws");
        WebSocketServer = wsModule.WebSocketServer || wsModule.Server || wsModule;
    }
    catch (error) {
        logger.error("Trade websocket unavailable (ws module missing)", {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
    wss = new WebSocketServer({ server: httpServer, path: SOCKET_PATH });
    wss.on("connection", (socket, request) => {
        const userId = authenticate(request);
        if (!userId) {
            logger.warn("Trade socket rejected: unauthorized");
            try {
                socket.close(CLOSE_CODE_UNAUTHORIZED, "unauthorized");
            }
            catch (error) {
                // ignore
            }
            return;
        }
        socket.isAlive = true;
        const userConnections = register(userId, socket);
        logger.info("Trade socket connected", { userId, connections: userConnections });
        void sendSnapshot(socket, userId);
        socket.on("pong", () => {
            socket.isAlive = true;
        });
        socket.on("message", (raw) => {
            let message = null;
            try {
                message = JSON.parse(raw.toString());
            }
            catch (error) {
                return;
            }
            if (!message || typeof message.type !== "string") {
                return;
            }
            if (message.type === "ping") {
                send(socket, { type: "pong", serverTime: new Date().toISOString() });
                return;
            }
            if (message.type === "exit") {
                void flushUserContracts(userId);
            }
        });
        socket.on("close", () => {
            const remaining = unregister(userId, socket);
            logger.info("Trade socket closed", { userId, connections: remaining });
            if (remaining === 0) {
                void flushUserContracts(userId);
            }
        });
        socket.on("error", (error) => {
            logger.warn("Trade socket error", {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
        });
    });
    wss.on("error", (error) => {
        logger.error("Trade websocket server error", {
            error: error instanceof Error ? error.message : String(error),
        });
    });
    heartbeatTimer = setInterval(() => {
        if (!wss) {
            return;
        }
        for (const socket of wss.clients) {
            if (socket.isAlive === false) {
                try {
                    socket.terminate();
                }
                catch (error) {
                    // ignore
                }
                continue;
            }
            socket.isAlive = false;
            try {
                socket.ping();
            }
            catch (error) {
                // ignore
            }
        }
    }, HEARTBEAT_INTERVAL_MS);
    if (typeof heartbeatTimer.unref === "function") {
        heartbeatTimer.unref();
    }
    logger.info("Trade websocket hub started", { path: SOCKET_PATH });
    return wss;
}
