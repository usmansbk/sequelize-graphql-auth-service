import { SES } from "@aws-sdk/client-ses";
import { S3Client, S3 } from "@aws-sdk/client-s3";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

const { AWS_REGION } = process.env;

export const s3 = new S3({
  region: AWS_REGION,
});

export const s3Client = new S3Client({
  region: AWS_REGION,
});

export const ses = new SES({
  apiVersion: "2010-12-01",
  region: AWS_REGION,
  defaultProvider,
});
