import request from "supertest";
import app from "../../src/app";
import { ConfirmEmailPost } from "../../src/controllers/confirmEmail";
import UserModel, { User } from "../../src/models/User";
import { cognitoClient } from "../../src/routes/userRouter";

jest.mock("@aws-sdk/client-cognito-identity-provider");

describe(`confirm user email tests`, () => {
  let mockUser: User;
  let mockRequest: ConfirmEmailPost;

  beforeEach(() => {
    cognitoClient.send = jest.fn().mockResolvedValueOnce(null);
    mockUser = {
      username: "testuser",
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
    };
    mockRequest = {
      confirmCode: "abc123",
    };
    UserModel.retrieveById = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
  });

  test(`Should return 204 if all succeeds`, async () => {
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(204);
    expect(cognitoClient.send).toHaveBeenCalled();
  });

  test(`Should return 500 if cognito fails`, async () => {
    cognitoClient.send = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(500);
  });

  test(`Should return 400 if user lookup fails`, async () => {
    UserModel.retrieveById = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });

  test(`Should return 400 if schema validation fails`, async () => {
    mockRequest.confirmCode = "*)(^*";
    const response = await request(app).post("/users/someuserid/confirm").send(mockRequest);

    expect(response.statusCode).toBe(400);
  });
});
