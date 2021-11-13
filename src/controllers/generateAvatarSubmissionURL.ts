import { Request, Response } from "express";
import aws from "aws-sdk";
const region = "us-east-1";
const bucketName = "sporadic-development-bucket";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});
const generateAvatarSubmissionURL = async (req: Request, res: Response) => {
  console.log(accessKeyId);
  const filename = "avatar.png";
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60,
  };
  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return res.send(uploadURL);
};

export default generateAvatarSubmissionURL;
