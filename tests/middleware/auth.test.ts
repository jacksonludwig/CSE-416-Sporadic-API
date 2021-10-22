import { Request, Response, NextFunction } from "express";
import { validateToken } from "../../src/middleware/auth";

jest.mock("cognito-jwt-verify", () => ({
  verifyCognitoToken: jest
    .fn()
    .mockResolvedValueOnce("success")
    .mockRejectedValueOnce(new Error("mock Err")),
}));

describe(`auth unit tests`, () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {
        Authorization: "Bearer e28d89b5-8b54-49b9-aaaa-dd1855e4a4ff",
      },
    };

    mockResponse = {
      sendStatus: jest.fn(),
    };

    nextFunction = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should succeed if verifying token succeeds`, async () => {
    await validateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test(`Should send 401 if verifying token fails`, async () => {
    await validateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(0);
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
  });

  test(`Should send 401 if no token exists`, async () => {
    mockRequest = {};
    await validateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(0);
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
  });
});
