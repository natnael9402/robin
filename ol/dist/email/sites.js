"use strict";
/**
 * Brand registry for the two customer-facing sites that share this backend.
 * Only these two ids/hosts are accepted - verification links must never be
 * built from an untrusted `site`/`Origin` value (open redirect risk).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SITES = exports.resolveSite = exports.normalizeSiteId = exports.logoUrl = exports.siteLegalLinks = void 0;

const SITES = {
    premium: {
        id: "premium",
        name: "Paxora Premium",
        shortName: "PAXORA",
        url: process.env.EMAIL_PREMIUM_URL || "https://paxorapremiumlab.com",
        tagline: "Your Smart Trading Companion",
        color: "#D4AF37",
    },
    lab: {
        id: "lab",
        name: "Paxora",
        shortName: "PAXORA",
        url: process.env.EMAIL_LAB_URL || "https://paxoralab.com",
        tagline: "Your Trading Companion",
        color: "#D4AF37",
    },
};
exports.SITES = SITES;

const DEFAULT_SITE_ID = () => (process.env.DEFAULT_EMAIL_SITE === "lab" ? "lab" : "premium");

function normalizeSiteId(value, fallback) {
    // Accept either a site id/host string or an already-resolved SITES object.
    // Without this, resolveSite(resolveSite("lab")) would silently fall back to premium.
    if (value && typeof value === "object" && SITES[value.id]) return value.id;
    const raw = String(value == null ? "" : value).trim().toLowerCase();
    if (SITES[raw]) return raw;
    if (raw.includes("paxoralab")) return "lab";
    if (raw.includes("paxorapremiumlab")) return "premium";
    return fallback || DEFAULT_SITE_ID();
}
exports.normalizeSiteId = normalizeSiteId;

function resolveSite(value) {
    return SITES[normalizeSiteId(value)];
}
exports.resolveSite = resolveSite;

/** Absolute URL is mandatory: relative image paths do not render in email clients. */
function logoUrl(site) {
    const configured = process.env.EMAIL_LOGO_URL;
    if (configured && configured.trim()) {
        return configured.trim().replace("{site}", site.id);
    }
    return `${site.url}/email-logo.png`;
}
exports.logoUrl = logoUrl;

function siteLegalLinks(site) {
    return {
        terms: `${site.url}/legal/terms`,
        privacy: `${site.url}/legal/privacy`,
        home: site.url,
    };
}
exports.siteLegalLinks = siteLegalLinks;
