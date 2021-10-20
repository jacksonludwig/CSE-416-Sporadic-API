import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export function validateToken(req: Request, res: Response, next: NextFunction) {
  console.log("looks good wow");
  next();
}
