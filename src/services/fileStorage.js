import aws from "aws-sdk";

const { AWS_REGION } = process.env;

export const s3 = new aws.S3({ region: AWS_REGION });

const remove = ({ key: Key, bucket: Bucket }) =>
  s3.deleteObject({ Key, Bucket });

const fileStorage = {
  remove,
};

export default fileStorage;
