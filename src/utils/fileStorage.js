import s3 from "~services/s3";
import log from "~utils/logger";

const remove = ({ key: Key, bucket: Bucket }) =>
  s3.deleteObject({ Key, Bucket }, (err) => {
    if (err) {
      log.info(err);
    }
  });

const fileStorage = {
  remove,
};

export default fileStorage;
