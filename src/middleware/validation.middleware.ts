import { logger, sendError } from "devdad-express-utils";
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    logger.info("Validation Middleware Result: ", { result });
    if (!result.success) {
      return sendError(res, "Zod Validation Failed.", 400, result.error.issues);
    }

    next();
  };
