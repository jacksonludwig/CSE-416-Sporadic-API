import request from "supertest";
import app from "../../src/app";
import PlatformModel, { Platform } from "../../src/models/Platform";

const username = "john1";

jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => {
    res.locals.authenticatedUser = username;
    next();
  }),
}));

describe(`create platform test`, () => {
  let mockPlatform: Platform;

  beforeEach(() => {
    mockPlatform = {
      title: "mocktitle",
      owner: username,
    };

    PlatformModel.retrieveByTitle = jest.fn().mockResolvedValueOnce(null);
    PlatformModel.prototype.save = jest.fn().mockResolvedValueOnce(null);
  });

  test(`Should create platform on success`, async () => {

  });
});
