import request from "supertest";
import app from "../../src/app";
import { validateToken } from "../../src/middleware/auth";
import PlatformModel, { Platform } from "../../src/models/Platform";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`get user by username route test`, () => {
  let mockPlatform: Platform;
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementationOnce(() => null);

    mockPlatform = {
      title: "testtitle",
      description: "description example",
      owner: "john1",
      moderators: [],
      bannedUsers: [],
      subscribers: [],
      quizzes: [],
      scores: [],
    };

    PlatformModel.retrieveByTitle = jest
      .fn()
      .mockResolvedValueOnce(new PlatformModel(mockPlatform));
  });

  test(`Should send back user on success`, async () => {
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(mockPlatform);
  });

  test(`Should send back 500 if lookup fails`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockRejectedValueOnce(new Error("mock err"));
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });

  test(`Should send back 400 if no user is returned`, async () => {
    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    const response = await request(app).get(`/platforms/${mockPlatform.title}`);

    expect(validateToken).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });
});
