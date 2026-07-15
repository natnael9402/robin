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
exports.deleteNewsArticle = exports.updateNewsArticle = exports.createNewsArticle = exports.getArticleBySlug = exports.getArticleById = exports.listAllNews = exports.listPublishedNews = exports.fetchExternalNews = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const axios_1 = __importDefault(require("axios"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const response_cache_1 = require("../utils/response-cache");
const logger_1 = require("../utils/logger");
const parser = new rss_parser_1.default();
const RSS_FEEDS = [
  { url: "https://cointelegraph.com/rss", source: "Cointelegraph" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
  { url: "https://decrypt.co/feed", source: "Decrypt" },
  { url: "https://bitcoinmagazine.com/.rss/full/", source: "Bitcoin Magazine" },
];
const serializeArticle = (article) => {
  var _a;
  return Object.assign(Object.assign({}, article), {
    id: (_a = article.id) === null || _a === void 0 ? void 0 : _a.toString(),
  });
};
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 500);
};
const parseRSSItem = (item, feedLabel) => {
  var _a;
  const title = item.title || "Untitled";
  const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
  const content = item.contentSnippet || item.content || title;
  const imageUrl = ((_a = item.enclosure) === null || _a === void 0 ? void 0 : _a.url) ||
    (item["media:content"] && item["media:content"].$) ||
    null;
  return {
    id: null,
    title,
    slug: generateSlug(title) + "-" + (item.guid || item.link || title).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20),
    excerpt: content.slice(0, 300),
    content,
    image_url: typeof imageUrl === "string" ? imageUrl : null,
    author: item.creator || item.author || feedLabel,
    source: "external",
    source_url: item.link || null,
    is_published: true,
    published_at: pubDate,
    created_at: pubDate,
    updated_at: pubDate,
  };
};
const fetchExternalNews = () => __awaiter(void 0, void 0, void 0, function* () {
  const results = [];
  const errors = [];
  yield Promise.all(RSS_FEEDS.map((feed) => __awaiter(void 0, void 0, void 0, function* () {
    try {
      const parsed = yield parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, 15);
      for (const item of items) {
        results.push(parseRSSItem(item, feed.source));
      }
    }
    catch (error) {
      errors.push({ source: feed.source, error: error instanceof Error ? error.message : String(error) });
    }
  })));
  if (errors.length > 0) {
    logger_1.logger.warn("RSS fetch had errors", { errors });
  }
  results.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  return results.slice(0, 30);
});
exports.fetchExternalNews = fetchExternalNews;
const getExternalNews = () => __awaiter(void 0, void 0, void 0, function* () {
  return (0, response_cache_1.serveWithCache)("news:cryptopanic", exports.fetchExternalNews, {
    freshMs: 5 * 60 * 1000,
  });
});
exports.getExternalNews = getExternalNews;
const getPaginated = (query, countQuery) => __awaiter(void 0, void 0, void 0, function* () {
  const [items, total] = yield Promise.all([query, countQuery]);
  return {
    items: items.map(serializeArticle),
    total,
  };
});
const listPublishedNews = (page, limit, source) => __awaiter(void 0, void 0, void 0, function* () {
  limit = +limit;
  const skip = (page - 1) * limit;
  const where = { is_published: true };
  if (source) {
    where.source = source;
  }
  const [manualItems, externalItems, manualTotal] = yield Promise.all([
    prisma_1.default.newsArticle.findMany({
      where,
      orderBy: { published_at: "desc" },
      skip,
      take: source ? limit : 100,
    }),
    getExternalNews(),
    prisma_1.default.newsArticle.count({ where }),
  ]);
  let merged = [];
  if (!source || source === "external") {
    merged = merged.concat(externalItems);
  }
  if (!source || source === "manual") {
    merged = merged.concat(manualItems.map(serializeArticle));
  }
  merged.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  const total = manualTotal + (source === "manual" ? 0 : externalItems.length);
  const paginated = merged.slice(skip, skip + limit);
  return { items: paginated, total };
});
exports.listPublishedNews = listPublishedNews;
const listAllNews = (page, limit, source) => __awaiter(void 0, void 0, void 0, function* () {
  limit = +limit;
  const skip = (page - 1) * limit;
  const where = {};
  if (source) {
    where.source = source;
  }
  return getPaginated(
    prisma_1.default.newsArticle.findMany({
      where,
      orderBy: { published_at: "desc" },
      skip,
      take: limit,
    }),
    prisma_1.default.newsArticle.count({ where })
  );
});
exports.listAllNews = listAllNews;
const getArticleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
  const article = yield prisma_1.default.newsArticle.findUnique({ where: { id } });
  return article ? serializeArticle(article) : null;
});
exports.getArticleById = getArticleById;
const getArticleBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
  const article = yield prisma_1.default.newsArticle.findUnique({
    where: { slug, is_published: true },
  });
  if (article) return serializeArticle(article);
  const externalItems = yield exports.getExternalNews();
  const external = externalItems.find((item) => item.slug === slug);
  return external || null;
});
exports.getArticleBySlug = getArticleBySlug;
const createNewsArticle = (data) => __awaiter(void 0, void 0, void 0, function* () {
  let slug = data.slug;
  if (!slug) {
    slug = generateSlug(data.title);
  }
  const existing = yield prisma_1.default.newsArticle.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now();
  }
  const article = yield prisma_1.default.newsArticle.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content || null,
      image_url: data.image_url || null,
      author: data.author || "PAXORA Premium",
      source: "manual",
      source_url: null,
      is_published: data.is_published !== undefined ? data.is_published : true,
      published_at: data.is_published ? new Date() : new Date(),
    },
  });
  return serializeArticle(article);
});
exports.createNewsArticle = createNewsArticle;
const updateNewsArticle = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
  const existing = yield prisma_1.default.newsArticle.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.image_url !== undefined) updateData.image_url = data.image_url;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.is_published !== undefined) {
    updateData.is_published = data.is_published;
    if (data.is_published && !existing.published_at) {
      updateData.published_at = new Date();
    }
  }
  const article = yield prisma_1.default.newsArticle.update({
    where: { id },
    data: updateData,
  });
  return serializeArticle(article);
});
exports.updateNewsArticle = updateNewsArticle;
const deleteNewsArticle = (id) => __awaiter(void 0, void 0, void 0, function* () {
  const existing = yield prisma_1.default.newsArticle.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }
  yield prisma_1.default.newsArticle.delete({ where: { id } });
  return serializeArticle(existing);
});
exports.deleteNewsArticle = deleteNewsArticle;
