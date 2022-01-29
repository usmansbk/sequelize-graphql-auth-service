import s3 from "~services/s3";
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

const files = {
  remove,
};

export default files;
