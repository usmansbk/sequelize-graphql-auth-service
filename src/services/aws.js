import aws from "aws-sdk";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

const { AWS_REGION } = process.env;

export const s3 = new aws.S3();

export const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: AWS_REGION,
  defaultProvider,
});

export default aws;
