import { Request, Response, NextFunction } from "express";
import { verifyCognitoToken } from "cognito-jwt-verify";

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers?.Authorization;

    if (!auth) return res.sendStatus(401);

    await verifyCognitoToken(
      process.env.COGNITO_REGION || "",
      process.env.COGNITO_POOL_ID || "",
      (auth as string).split(" ")[1],
      process.env.COGNITO_APP_CLIENT_ID || "",
    );

    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(401);
  }
};
