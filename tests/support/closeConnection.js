import db from "~db/models";
import cache from "~utils/cache";

afterEach((done) => {
  cache.clearAll().then(() => done());
});

afterAll((done) => {
  db.sequelize
    .close()
    .then(() => cache.close())
    .then(() => done())
    .catch(done);
});
