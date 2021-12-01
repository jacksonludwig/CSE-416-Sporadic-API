import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import UserModel from "../../src/models/User";
import mockUser from "../mocks/mockUser";

jest.mock("@aws-sdk/client-cognito-identity-provider");
jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`get user by username route test`, () => {
  let mockUserModel: UserModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockUserModel = new UserModel(mockUser);

    UserModel.retrieveUserSortedFriends = jest.fn().mockResolvedValueOnce(mockUserModel);
  });

  test(`Should send back user with private data if user matches query on success`, async () => {
    const response = await request(app).get(`/users/${mockUserModel["username"]}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).toEqual(
      JSON.stringify(mockUserModel.toJSONWithPrivateData()),
    );
  });

  test(`Should send back user with public data if user doesn't match query on success`, async () => {
    mockUserModel["username"] = "wrongname";
    const response = await request(app).get(`/users/${mockUserModel["username"]}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.stringify(response.body)).toEqual(JSON.stringify(mockUserModel.toJSON()));
  });

  test(`Should send back 500 if lookup fails`, async () => {
    UserModel.retrieveUserSortedFriends = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/users/${mockUserModel["username"]}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no user is returned`, async () => {
    UserModel.retrieveUserSortedFriends = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/users/${mockUserModel["username"]}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
