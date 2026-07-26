import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { s3 } from "../config/s3.js";

export const uploadToS3 = async (fileName, buffer, contentType) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME env variable is not set");
  }
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Body: buffer,
      Key: fileName,
      ContentType: contentType,
    }),
  );

  return fileName;
};
