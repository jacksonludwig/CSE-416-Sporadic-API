import { Request, Response, NextFunction } from "express";
import { verifyCognitoToken } from "cognito-jwt-verify";

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1]; // token should be "Bearer: <token>"

    if (!token) return res.sendStatus(401);

    await verifyCognitoToken(
      process.env.COGNITO_REGION || "",
      process.env.COGNITO_POOL_ID || "",
      token,
      process.env.COGNITO_WEB_CLIENT_ID || "",
    );

    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(401);
  }
};
