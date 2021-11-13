import { Request, Response } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucketName = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const generateAvatarSubmissionURL = async (req: Request, res: Response) => {
  try {
    if (res.locals.authenticatedUser !== req.params.username) return res.sendStatus(401);

    const key = `users/${req.params.username}/avatar.png`;

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
      if (err && err.$metadata && err.$metadata.httpStatusCode < 500)
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

export default generateAvatarSubmissionURL;
