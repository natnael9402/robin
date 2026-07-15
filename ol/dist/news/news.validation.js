"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsUpdateValidator = exports.newsCreateValidator = exports.newsSlugParamValidator = exports.newsIdParamValidator = exports.newsListValidator = void 0;
const { param, body, query } = require("express-validator");
exports.newsListValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("source").optional().isString().trim(),
];
exports.newsIdParamValidator = [
  param("id").isInt({ min: 1 }).toInt(),
];
exports.newsSlugParamValidator = [
  param("slug").isString().trim().notEmpty(),
];
exports.newsCreateValidator = [
  body("title")
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Title is required and must be under 500 characters"),
  body("slug")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 }),
  body("excerpt")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim(),
  body("content")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim(),
  body("image_url")
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image URL must be a valid http or https URL"),
  body("author")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 255 }),
  body("is_published")
    .optional()
    .isBoolean()
    .toBoolean(),
];
exports.newsUpdateValidator = [
  param("id").isInt({ min: 1 }).toInt(),
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 }),
  body("slug")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 }),
  body("excerpt")
    .optional({ nullable: true })
    .isString()
    .trim(),
  body("content")
    .optional({ nullable: true })
    .isString()
    .trim(),
  body("image_url")
    .optional({ nullable: true })
    .isString(),
  body("author")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 }),
  body("is_published")
    .optional()
    .isBoolean()
    .toBoolean(),
];
