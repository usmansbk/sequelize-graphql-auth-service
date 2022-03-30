import SequelizeDataSource from "./SequelizeDataSource";

export default class FileDS extends SequelizeDataSource {
  onDestroy({ oldImage }) {
    super.onDestroy({ oldImage });
    this.context.fileStorage.remove(oldImage);
  }
}
