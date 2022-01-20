import db from "~db/models";
import UserDS from "./user";
import FileDS from "./file";
import RoleDS from "./role";

const dataSources = () => ({
  users: new UserDS(db.User),
  files: new FileDS(db.File),
  roles: new RoleDS(db.Role),
});

export default dataSources;
