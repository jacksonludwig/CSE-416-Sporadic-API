import { Request, Response } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
const bucketName = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const generateQuizAwardIconSubmissionURL = async (req: Request, res: Response) => {
  try {
    const platform = await PlatformModel.retrieveByTitle(req.params.platform);

    if (!platform) {
      console.error(`${req.params.platform} not found in database`);
      return res.sendStatus(400);
    }

    const quiz = await QuizModel.retrieveByTitle(req.params.platform, req.params.quiz);
    if (!quiz) {
      console.error(`${req.params.quiz} not found in database`);
      return res.sendStatus(400);
    }

    if (
      res.locals.authenticatedUser !== platform.getOwner() &&
      !platform.moderators.includes(res.locals.authenticatedUser)
    ) {
      console.error(
        `${res.locals.authenticatedUser} is not an owner or moderator of ${req.params.platform}`,
      );
      return res.sendStatus(403);
    }
    const key = `platforms/${req.params.platform}/${req.params.quiz}/award.png`;

    const s3Client = new S3Client({
      region: process.env.COGNITO_REGION,
      credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
      },
    });

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    let url: string;

    try {
      url = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });
    } catch (err) {
      if (err.$metadata && err.$metadata.httpStatusCode < 500)
        return res.status(err.$metadata.httpStatusCode).send({
          name: err.name,
          message: err.message,
        });
      throw err;
    }

    return res.send(url);
  } catch (err) {
    return res.sendStatus(500);
  }
};

export default generateQuizAwardIconSubmissionURL;
