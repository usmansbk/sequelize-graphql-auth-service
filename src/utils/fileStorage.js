import { s3 } from "~services/aws";
import log from "~utils/logger";

const remove = ({ key: Key, bucket: Bucket }) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  s3.deleteObject({ Key, Bucket }, (err) => {
    if (err) {
      log.info(err);
    }
  });
};

const fileStorage = {
  remove,
};

export default fileStorage;