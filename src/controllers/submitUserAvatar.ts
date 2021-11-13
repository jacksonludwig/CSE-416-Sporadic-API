import { Request, Response } from "express";
import dotenv from "dotenv";
import aws from "aws-sdk";
const region = "us-east-1";
const bucketName = "sporadic-development-bucket";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
});
const submitUserAvatar = async (req: Request, res: Response) => {
  const filename = "avatar";
  console.log("hey there");
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60,
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  await fetch(uploadURL, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: req.body,
  });
};

export default submitUserAvatar;
