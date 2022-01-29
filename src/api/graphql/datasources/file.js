import SequelizeDataSource from "./SequelizeDataSource";

export default class FileDS extends SequelizeDataSource {
  onDestroy({ oldImage }) {
    this.context.files.remove(oldImage);
  }
}
