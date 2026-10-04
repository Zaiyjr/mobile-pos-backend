import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../../domain/errors/AppError.js";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")));
      return;
    }
    req.body = result.data;
    next();
  };
}
