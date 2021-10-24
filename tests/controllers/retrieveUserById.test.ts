import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import UserModel, { User } from "../../src/models/User";

jest.mock("@aws-sdk/client-cognito-identity-provider");
jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`get user by id route test`, () => {
  let mockUser: User;
  beforeEach(() => {
    mockUser = {
      username: "testuser",
      email: "email@email.com",
      cognitoId: "asdkjskdjfas",
    };
    UserModel.retrieveById = jest.fn().mockResolvedValueOnce(new UserModel(mockUser));
  });

  test(`Should send back user on success`, async () => {
    const response = await request(app).get("/users/exampleuserid");

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(mockUser);
  });

  test(`Should send back 500 if lookup fails`, async () => {
    UserModel.retrieveById = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get("/users/exampleuserid");

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no user is returned`, async () => {
    UserModel.retrieveById = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get("/users/exampleuserid");

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
