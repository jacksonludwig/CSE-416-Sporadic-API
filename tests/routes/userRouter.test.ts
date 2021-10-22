import request from "supertest";
import app from "../../src/app";
import { UserPostData, cognitoClient } from "../../src/routes/userRouter";
import UserModel, { User } from "../../src/models/User";
import { validateToken } from "../../src/middleware/auth";

jest.mock("@aws-sdk/client-cognito-identity-provider");
jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`userRouter unit tests`, () => {
  describe(`create user route test`, () => {
    let mockRequest: UserPostData;
    let mockObjectId: string;

    const mockSendResponse = {
      $metadata: {
        httpStatusCode: 200,
      },
      UserConfirmed: false,
      UserSub: "kdlaid2j-d8-2ff-elm-fu8m",
    };

    beforeEach(() => {
      mockRequest = {
        username: "john1",
        email: "john1@gmail.com",
        password: "password123",
      };

      mockObjectId = "6171a986cd40f34535c91e8d";

      cognitoClient.send = jest.fn().mockResolvedValueOnce(mockSendResponse);
      UserModel.prototype.save = jest.fn().mockResolvedValueOnce(mockObjectId);
      UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce(null);
    });

    test(`Should send 400 if schema validation fails`, async () => {
      mockRequest.username = "";

      const response = await request(app).post("/users/").send(mockRequest);

      expect(response.statusCode).toBe(400);
    });

    test(`Should send 400 if username already exists`, async () => {
      UserModel.retrieveByUsername = jest.fn().mockResolvedValueOnce({});

      const response = await request(app).post("/users/").send(mockRequest);

      expect(response.statusCode).toBe(400);
    });

    test(`Should send 200 with cognito id if all succeeds`, async () => {
      const response = await request(app).post("/users/").send(mockRequest);

      expect(response.statusCode).toBe(200);
      expect(UserModel.retrieveByUsername).toHaveBeenCalled();
      expect(UserModel.prototype.save).toHaveBeenCalled();
      expect(response.body).toStrictEqual({
        userId: mockObjectId,
      });
    });

    test(`Should send 500 if congito fails`, async () => {
      const mockErr = new Error("this is a mock error");
      cognitoClient.send = jest.fn().mockRejectedValueOnce(mockErr);
      const response = await request(app).post("/users/").send(mockRequest);

      expect(response.statusCode).toBe(500);
      expect(UserModel.retrieveByUsername).toHaveBeenCalled();
    });
  });

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
});
