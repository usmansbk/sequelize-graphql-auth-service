import db from "~db/models";
import cache from "~utils/cache";

afterEach((done) => {
  cache
    .clearAll()
    .then(() => done())
    .catch(done);
});

afterAll((done) => {
  cache.close();
  db.sequelize
    .close()
    .then(() => done())
    .catch(done);
});
