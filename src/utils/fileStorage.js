import { s3 } from "~services/aws";
import log from "~utils/logger";

const remove = async ({ key: Key, bucket: Bucket }) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  if (!(Key && Bucket)) {
    return;
  }

  try {
    await s3.deleteObject({ Key, Bucket }).promise();
  } catch (e) {
    log.error(e);
  }
};

const fileStorage = {
  remove,
};

export default fileStorage;
