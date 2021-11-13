import { Request, Response } from "express";
import aws from "aws-sdk";
const region = process.env.COGNITO_REGION;
const bucketName = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});
const generateAvatarSubmissionURL = async (req: Request, res: Response) => {
  const filename = "avatar.png";
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60,
  };
  s3.getSignedUrlPromise("putObject", params)
    .then((url) => {
      return res.send(url);
    })
    .catch((error) => {
      console.log(error);
      return res.sendStatus(500);
    });
};

export default generateAvatarSubmissionURL;
