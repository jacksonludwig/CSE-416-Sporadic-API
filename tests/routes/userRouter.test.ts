import request from "supertest";
import app from "../../src/app";
import { ConfirmEmailPost } from "../../src/controllers/confirmEmail";
import { CreateUserPost } from "../../src/controllers/createUser";
import { validateToken } from "../../src/middleware/auth";
import UserModel, { User } from "../../src/models/User";
import { cognitoClient } from "../../src/routes/userRouter";

jest.mock("@aws-sdk/client-cognito-identity-provider");
jest.mock("../../src/middleware/auth", () => ({
  validateToken: jest.fn((req, res, next) => next()),
}));

describe(`userRouter unit tests`, () => {
  describe(`create user route test`, () => {
    let mockRequest: CreateUserPost;
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
        _id: mockObjectId,
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
});
