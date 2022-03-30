jest.mock("ioredis", () => require("ioredis-mock"));

import store from "~utils/store";

afterAll(async () => {
  await store.clearAll();
});
