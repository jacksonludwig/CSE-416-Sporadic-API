import { Request, Response } from "express";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
const bucketName = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const deleteQuizByTitle = async (req: Request, res: Response) => {
  const { platform, quizTitle } = req.params;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const quiz = await QuizModel.retrieveByTitle(platform, quizTitle);

    if (!quiz) {
      console.error(`${platform}/${quizTitle} does not exist`);
      return res.sendStatus(400);
    }

    const platformObj = await PlatformModel.retrieveByTitle(platform);

    if (!platformObj) {
      console.error(`${platform} does not exist`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platformObj) < Sporadic.Permissions.Moderator) {
      console.error(`${username} not an owner or moderator of ${platform}`);
      return res.sendStatus(403);
    }

    await quiz.delete();

    platformObj.quizzes = platformObj.quizzes.filter((q) => q !== quizTitle);
    platformObj.pinnedQuizzes = (platformObj.pinnedQuizzes as string[]).filter(
      (q) => q !== quizTitle,
    );
    const key = `platforms/${req.params.platform}/${req.params.quiz}`;

    const s3Client = new S3Client({
      region: process.env.COGNITO_REGION,
      credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
      },
    });

    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    let url: string;

    try {
      url = await getSignedUrl(s3Client, deleteCommand, { expiresIn: 3600 });
    } catch (err) {
      if (err.$metadata && err.$metadata.httpStatusCode < 500)
        return res.status(err.$metadata.httpStatusCode).send({
          name: err.name,
          message: err.message,
        });
      throw err;
    }

    await platformObj.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default deleteQuizByTitle;
