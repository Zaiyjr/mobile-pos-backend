import type { Request, Response, NextFunction } from "express";

const GENERIC_500 = "ມີບາງຢ່າງຜິດພາດໃນລະບົບ! (Internal server error)";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Always log the full stack server-side for debugging.
    console.error(err.stack || err);

    const status = typeof err.statusCode === "number" ? err.statusCode : 500;
    const isServerError = status >= 500;
    const isProduction = process.env.NODE_ENV === "production";

    // Known 4xx AppErrors carry safe, user-facing messages. For 5xx we never
    // leak internals (SQL text, stack, config) — production gets a generic
    // message, non-production keeps the detail to aid debugging.
    const message =
        isServerError && isProduction ? GENERIC_500 : err.message || GENERIC_500;

    res.status(status).json({
        success: false,
        status,
        message,
    });
};
