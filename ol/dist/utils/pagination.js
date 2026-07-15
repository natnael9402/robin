"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLengthAwarePaginator = exports.getNumericQueryValue = void 0;
const extractNumericValue = (value) => {
    if (Array.isArray(value) && value.length > 0) {
        return extractNumericValue(value[value.length - 1]);
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }
        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return null;
};
const getNumericQueryValue = (value, fallback, options = {}) => {
    let numeric = extractNumericValue(value);
    if (numeric === null) {
        numeric = fallback;
    }
    if (options.min !== undefined && numeric < options.min) {
        numeric = options.min;
    }
    if (options.max !== undefined && numeric > options.max) {
        numeric = options.max;
    }
    return numeric;
};
exports.getNumericQueryValue = getNumericQueryValue;
const buildBaseQueryParams = (req) => {
    const params = new URLSearchParams();
    const entries = req.query;
    Object.entries(entries).forEach(([key, rawValue]) => {
        if (key === "page" || key === "perPage" || key === "per_page") {
            return;
        }
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        values.forEach((item) => {
            if (typeof item === "string" || typeof item === "number") {
                params.append(key, String(item));
            }
        });
    });
    return params;
};
const normalizePerPageParam = (req, defaultPerPage) => {
    var _a, _b;
    const query = req.query;
    const rawPerPage = (_b = (_a = query["per_page"]) !== null && _a !== void 0 ? _a : query.perPage) !== null && _b !== void 0 ? _b : query.per_page;
    if (Array.isArray(rawPerPage) && rawPerPage.length > 0) {
        return String(rawPerPage[rawPerPage.length - 1]);
    }
    if (typeof rawPerPage === "string" || typeof rawPerPage === "number") {
        return String(rawPerPage);
    }
    return String(defaultPerPage);
};
const buildLengthAwarePaginator = (req, data, pagination) => {
    const { page, perPage, total } = pagination;
    const lastPage = Math.max(Math.ceil(total / perPage), 1);
    const hasData = data.length > 0 && total > 0;
    const from = hasData ? (page - 1) * perPage + 1 : null;
    const to = hasData
        ? Math.min((page - 1) * perPage + data.length, total)
        : null;
    const basePath = `${req.baseUrl}${req.path}`;
    const baseQueryParams = buildBaseQueryParams(req);
    const perPageValue = normalizePerPageParam(req, perPage);
    if (!baseQueryParams.has("per_page")) {
        baseQueryParams.set("per_page", perPageValue);
    }
    const makeUrl = (pageNumber) => {
        const params = new URLSearchParams(baseQueryParams.toString());
        params.set("page", String(pageNumber));
        const queryString = params.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    };
    const links = [
        {
            url: page > 1 ? makeUrl(page - 1) : null,
            label: "&laquo; Previous",
            active: false,
        },
        ...Array.from({ length: lastPage }, (_, index) => {
            const pageNumber = index + 1;
            return {
                url: makeUrl(pageNumber),
                label: String(pageNumber),
                active: pageNumber === page,
            };
        }),
        {
            url: page < lastPage ? makeUrl(page + 1) : null,
            label: "Next &raquo;",
            active: false,
        },
    ];
    return {
        current_page: page,
        data,
        first_page_url: makeUrl(1),
        from,
        last_page: lastPage,
        last_page_url: makeUrl(lastPage),
        links,
        next_page_url: page < lastPage ? makeUrl(page + 1) : null,
        path: basePath,
        per_page: perPage,
        prev_page_url: page > 1 ? makeUrl(page - 1) : null,
        to,
        total,
    };
};
exports.buildLengthAwarePaginator = buildLengthAwarePaginator;
