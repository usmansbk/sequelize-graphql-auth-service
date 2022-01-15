import SequelizeDataSource from "./SequelizeDataSource";

export default class FileDS extends SequelizeDataSource {
  onDestroy(file) {
    this.context.fileStorage.remove(file);
  }
}
