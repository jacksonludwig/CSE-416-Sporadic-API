import { Request, Response, NextFunction } from "express";
import { verifyCognitoToken } from "cognito-jwt-verify";

type Token = {
  ["cognito:username"]: string;
};

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1]; // token should be "Bearer <token>"

    if (!token) return res.sendStatus(401);

    const decodedToken = await verifyCognitoToken(
      process.env.COGNITO_REGION || "",
      process.env.COGNITO_POOL_ID || "",
      token,
      process.env.COGNITO_WEB_CLIENT_ID || "",
    );

    // Save the user for use in protected routes to authorize certain actions.
    res.locals.authenticatedUser = (decodedToken as Token)["cognito:username"];

    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(401);
  }
};
