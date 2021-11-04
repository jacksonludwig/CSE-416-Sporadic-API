import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel, { Platform } from "../../src/models/Platform";
import UserModel from "../../src/models/User";
import mockUser from "../mocks/mockUser";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = mockUser.username;
    next();
  }),
}));

describe(`unsubscribe user tests`, () => {
  let mockPlatform: Platform;
  let mockUserModel: UserModel;
  let mockPlatformModel: PlatformModel;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockPlatform = {
      title: "testtitle",
      description: "description example",
      owner: "john1",
      moderators: [],
      bannedUsers: [],
      subscribers: [mockUser.username],
      quizzes: [],
    };

    mockUserModel = new UserModel(mockUser);
    mockUserModel.subscriptions = [mockPlatform.title];

    mockPlatformModel = new PlatformModel(mockPlatform);

    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(mockPlatformModel);
    PlatformModel.prototype.update = jest.fn().mockResolvedValueOnce(null);

    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(mockUserModel);
    UserModel.prototype.update = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should send back 204 on success`, async () => {
    const response = await request(app).patch(`/platforms/${mockPlatform.title}/unsubscribe`);

    expect(mockPlatformModel.subscribers.indexOf(mockUser.username)).toBe(-1);
    expect(mockUserModel.subscriptions.indexOf(mockPlatform.title)).toBe(-1);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(204);
  });

  test(`Should send back 500 if lookup of platform fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).patch(`/platforms/${mockPlatform.title}/unsubscribe`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if lookup of user fails`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).patch(`/platforms/${mockPlatform.title}/unsubscribe`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 500 if no user is returned`, async () => {
    UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).patch(`/platforms/${mockPlatform.title}/unsubscribe`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no platform is returned`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).patch(`/platforms/${mockPlatform.title}/unsubscribe`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
