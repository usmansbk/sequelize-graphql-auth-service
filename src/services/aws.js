import { SESClient } from "@aws-sdk/client-ses";
import { S3Client } from "@aws-sdk/client-s3";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

const { AWS_REGION } = process.env;

export const s3 = new S3Client({
  region: AWS_REGION,
});

export const ses = new SESClient({
  region: AWS_REGION,
  credentialDefaultProvider: defaultProvider,
});

export default { s3, ses };
