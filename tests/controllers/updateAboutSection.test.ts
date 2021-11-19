import request from "supertest";
import app from "../../src/app";
import { UpdateAboutSectionRequest } from "../../src/controllers/updateAboutSection";
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
  let mockRequest: UpdateAboutSectionRequest;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockUserModel = new UserModel(mockUser);
    mockRequest = {
      aboutSection: "this is a new about section",
    };

    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUserModel);
    UserModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send back 204 on success`, async () => {
    const response = await request(app).patch(`/users/about`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 500 if lookup fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).patch(`/users/about`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if update fails`, async () => {
    UserModel.prototype.update = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).patch(`/users/about`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no user is returned`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).patch(`/users/about`).send(mockRequest);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  test(`Should send back 400 if schema fails to validate`, async () => {
    const response = await request(app).patch(`/users/about`).send({});

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
