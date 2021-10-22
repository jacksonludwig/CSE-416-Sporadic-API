import { Request, Response, NextFunction } from "express";

/**
 * Utility function to ignore the middleware on a specific route
 */
export const unless = (
  path: string,
  middleware: (req: Request, res: Response, next: NextFunction) => void,
) => {
  return function (req: Request, res: Response, next: NextFunction) {
    if (path === req.baseUrl) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};
