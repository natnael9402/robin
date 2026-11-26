"use strict";
/** Short-lived, purpose-scoped JWTs for email verification links. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signVerificationToken = exports.verifyVerificationToken = exports.VERIFICATION_TTL_HOURS = void 0;

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const VERIFICATION_TTL_HOURS = 24;
exports.VERIFICATION_TTL_HOURS = VERIFICATION_TTL_HOURS;
const PURPOSE = "email-verification";

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
}

function signVerificationToken(user, site) {
    return jwt.sign(
        {
            purpose: PURPOSE,
            sub: String(user.id),
            email: user.email || null,
            site: site && site.id ? site.id : "premium",
            jti: crypto.randomUUID(),
        },
        getSecret(),
        { expiresIn: `${VERIFICATION_TTL_HOURS}h`, algorithm: "HS256" }
    );
}
exports.signVerificationToken = signVerificationToken;

function verifyVerificationToken(token) {
    const payload = jwt.verify(String(token || ""), getSecret(), { algorithms: ["HS256"] });
    if (!payload || payload.purpose !== PURPOSE || !payload.sub || !payload.email) {
        const error = new Error("Invalid verification token");
        error.code = "INVALID_TOKEN";
        throw error;
    }
    return payload;
}
exports.verifyVerificationToken = verifyVerificationToken;
