import request from "supertest";
import app from "../../src/app";
import { ConfirmEmailPost } from "../../src/controllers/confirmEmail";
import UserModel, { User } from "../../src/models/User";
import { cognitoClient } from "../../src/routes/userRouter";

jest.mock("@aws-sdk/client-cognito-identity-provider");

describe(`confirm user email tests`, () => {
  let mockUser: User;
  let mockRequest: ConfirmEmailPost;
  let mockCognitoError: {
    $metadata: {
      httpStatusCode: number;
    };
    name: string;
    message: string;
  };

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);
    cognitoClient.send = jest.fn().mockResolvedValueOnce(null);

    mockUser = {
      username: "testuser",
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
    } as User;
    mockRequest = {
      confirmCode: "abc123",
    };
    mockCognitoError = {
      $metadata: {
        httpStatusCode: 200,
      },
      name: "success",
      message: "success",
    };

    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
  });

  test(`Should return 204 if all succeeds`, async () => {
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(204);
    expect(cognitoClient.send).toHaveBeenCalled();
  });

  test(`Should return 500 if cognito fails with 500`, async () => {
    mockCognitoError.$metadata.httpStatusCode = 500;
    cognitoClient.send = jest.fn().mockRejectedValueOnce(mockCognitoError);
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });

  test(`Should return 400 if cognito fails with 400`, async () => {
    mockCognitoError.$metadata.httpStatusCode = 400;
    cognitoClient.send = jest.fn().mockRejectedValueOnce(mockCognitoError);
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should return 400 if user lookup fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should return 400 if schema validation fails`, async () => {
    mockRequest.confirmCode = "*)(^*";
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });
});
