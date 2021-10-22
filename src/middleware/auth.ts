import { Request, Response, NextFunction } from "express";
import { verifyCognitoToken } from "cognito-jwt-verify";

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1]; // token should be "Bearer: <token>"

    if (!token) throw new Error("missing authorization header");

    const result = await verifyCognitoToken(
      process.env.COGNITO_REGION || "",
      process.env.COGNITO_POOL_ID || "",
      token || "",
      process.env.COGNITO_APP_CLIENT_ID || "",
    );

    console.log(result);

    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(401);
  }
};
