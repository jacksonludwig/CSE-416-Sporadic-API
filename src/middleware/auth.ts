import axios from "axios";
import { Request, Response, NextFunction } from "express";

const COGNITO_URL = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_POOL_ID}/.well-known/jwks.json`;

// https://github.com/ajstocchetti/aws-cognito-jwt-authenticate
// https://github.com/GioPat/cognito-jwt-verify

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers?.authorization?.split(" ")[1];

    const result = await axios.post(
      COGNITO_URL,
      {
        AccessToken: accessToken,
      },
      {
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
        },
      },
    );

    console.log(result);

    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
