import { Request, Response } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const bucketName = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const generateAvatarSubmissionURL = async (req: Request, res: Response) => {
  if (!(res.locals.authenticatedUser === req.params.username)) {
    return res.sendStatus(401);
  }
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
  const url = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });
  return res.send(url);
};

export default generateAvatarSubmissionURL;
