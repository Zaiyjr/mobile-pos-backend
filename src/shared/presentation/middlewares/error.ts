import type { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || "ມີບາງຢ່າງຜິດພາດໃນລະບົບ!";

    res.status(status).json({
        status,
        message,
    });
};
